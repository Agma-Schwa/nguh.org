import {type Actions, redirect, type RequestEvent} from '@sveltejs/kit';
import type {PageServerLoad, PageServerLoadEvent} from './$types';
import {error} from '@sveltejs/kit';
import {CCC_FORM_ENABLED, DISCORD_SERVER_ID, DISCORD_ADMIN_ID} from '$env/static/private';
import {LRUCache} from 'lru-cache';
import type {Session} from '@auth/sveltekit';

export const prerender = false;

// Cache of members that are in the guild to avoid hitting the Discord API all the time.
const guild_member_cache = new LRUCache({
    max: 50000,
    ttl: 1000 * 60 * 60 * 24, // TTL is 1 day.
    allowStale: false,
})

// Cache of members that are known to *not* be in the guild to prevent abuse.
const not_in_guild_cache = new LRUCache({
    max: 50000,
    ttl: 1000 * 60 * 5, // TTL is 5 minutes.
    allowStale: false,
})

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

const deny_msg = 'Forbidden\nYou must be a member of the Agma Schwa Discord server ' +
    'to access this page.\nIf you just joined, please wait a ' +
    'few minutes before trying again. If you want to join the server, click on ' +
    'the Discord icon in the banner.\nSorry for the inconvenience, but this is one ' +
    'of the only ways to keep ourselves sane during this entire process while also preventing ' +
    'people from spamming...'

async function CheckUserInGuild(session: Session, session_id: string) {
    // If the user is known to be in the guild, allow access.
    if (guild_member_cache.get(session_id) !== undefined)
        return

    // If the user is known *not* to be in the guild, deny access.
    if (not_in_guild_cache.get(session_id) !== undefined)
        error(403, deny_msg)

    // If they’re not in the cache, check the Discord API.
    const res = await fetch('https://discord.com/api/v10/users/@me/guilds', {
        headers: {
            'Authorization': `Bearer ${session.access_token}`
        }
    })

    // If we got an error response, we should ask the user to log back in.
    if (!res.ok) {
        // Because webdevs are too fucking incompetent to actually write proper
        // software, whatever genius conceived of this authentication framework
        // thought it too much of an ask to allow us to *log someone out server-side*,
        // because why would you *ever* need that. So to fix this, redirect them
        // to a stupid intermediate page that auto-submits a form action (because
        // even triggering that from here doesn’t work because why would it).
        redirect(307, '/auto-log-out-user');
    }

    // Validate that we got a response.
    const json = await res.json() as unknown
    if (!Array.isArray(json) || json.length === 0 || !("id" in json[0])) {
        console.error("Invalid response received from Discord: ", res)
        error(403, 'Forbidden\nWe could not retrieve your Discord info; try logging out and logging back in')
    }

    const guilds = json satisfies PartialGuild[] as PartialGuild[]
    if (!guilds.find(g => g.id === DISCORD_SERVER_ID)) {
        not_in_guild_cache.set(session_id, true)
        error(403, deny_msg);
    }

    // Cache the result so we don’t need to hit the Discord API every time.
    guild_member_cache.set(session_id, true)
    not_in_guild_cache.delete(session_id)
}

async function CheckAccess(event: PageServerLoadEvent | RequestEvent): Promise<string> {
    const session = await event.locals.auth()

    // Bail early to avoid hitting the Discord API if the form is disabled.
    if (CCC_FORM_ENABLED !== 'TRUE' && session?.user?.id !== DISCORD_ADMIN_ID) error(
        403,
        'Forbidden\nThe voting form is currently disabled.'
    )

    // Ensure the user is logged in.
    if (!session || !session.user || !session.user.id) redirect(307, "/login");

    // If they are make sure they are a member of the Agma Schwa Discord server.
    await CheckUserInGuild(session, session.user.id)

    // And return the ID.
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