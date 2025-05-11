import {type Actions, redirect, type RequestEvent} from '@sveltejs/kit';
import type {PageServerLoad, PageServerLoadEvent} from './$types';
import {error} from '@sveltejs/kit';
import {CCC_FORM_ENABLED, DISCORD_SERVER_ID, DISCORD_ADMIN_ID} from '$env/static/private';

export const prerender = false;

interface Vote {
    time_unix_ms: number,
    top1: string | null,
    top2: string | null,
    top3: string | null,
    top4: string | null,
    top5: string | null,
    top6: string | null
}

interface PartialGuild {
    id: string
}

function ConvertNull(s: FormDataEntryValue | null) {
    if (typeof s !== 'string') error(400, 'Invalid vote');
    if (s == '<none>') return null
    return s
}

async function CheckAccess(event: PageServerLoadEvent | RequestEvent): Promise<string> {
    const session = await event.locals.auth()

    // Check if the form is enabled.
    if (CCC_FORM_ENABLED !== 'TRUE' && session?.user?.id !== DISCORD_ADMIN_ID) error(
        403,
        'Forbidden\nThe voting form is currently disabled.'
    )

    // Ensure the user is logged in.
    if (!session) redirect(307, "/login");

    // If they are make sure they are a member of the Agma Schwa Discord server.
    const res = await fetch('https://discord.com/api/v10/users/@me/guilds', {
        headers: {
            'Authorization': `Bearer ${session.access_token}`
        }
    })

    const guilds = await res.json() as PartialGuild[]
    if (!guilds.find(g => g.id === DISCORD_SERVER_ID)) error(
        403,
        "Forbidden\nYou must be a member of the Agma Schwa Discord " +
        "server to access the CCC voting form. If you want to join, click on " +
        "the Discord icon in the banner.\nSorry for the inconvenience, but this is one " +
        "of the only ways to keep ourselves sane during this entire process while also preventing " +
        "people from spamming..."
    );

    if (!session.user?.id) error(500, "Internal Server Error\nMissing session id");
    return session.user.id;
}

export const actions: Actions = {
    default: async (event: RequestEvent) => {
        const user = await CheckAccess(event)

        // Extract the vote.
        const data = await event.request.formData()
        const votes = [
            ConvertNull(data.get('top1')),
            ConvertNull(data.get('top2')),
            ConvertNull(data.get('top3')),
            ConvertNull(data.get('top4')),
            ConvertNull(data.get('top5')),
            ConvertNull(data.get('top6'))
        ]

        // Validate that there are no duplicates. We allow duplicate nulls because
        // they indicate no vote.
        for (const vote of votes)
            if (vote && votes.filter(v => v === vote).length > 1)
                error(400, `You cannot vote for '${vote}' more than once!`);

        // Save it to the db.
        event.locals.db.run(`
            INSERT INTO votes VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (id) DO UPDATE SET
                time_unix_ms = excluded.time_unix_ms,
                top1 = excluded.top1,
                top2 = excluded.top2,
                top3 = excluded.top3,
                top4 = excluded.top4,
                top5 = excluded.top5,
                top6 = excluded.top6;
        `, [
            user,                 // id
            new Date().getTime(), // time_unix_ms
            ...votes              // top1–top6
        ])
    }
}

export const load: PageServerLoad = async (event) => {
    const user = await CheckAccess(event)

    // Get their previous vote.
    const res: [boolean, Vote | Error] = await new Promise(async (resolve) => {
        event.locals.db.get(
            'SELECT * FROM votes WHERE id = ?;',
            [user],
            (err: Error, row: Vote) => {
                if (err) resolve([false, err])
                resolve([true, row])
            }
        )
    })

    if (!res[0]) error(500, (res[1] as Error).message)

    // Check if the voting form is enabled.
    return {vote: res[1] as Vote, langs: event.locals.ccc_submissions}
};