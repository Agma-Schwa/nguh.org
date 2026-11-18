import {type Actions, redirect, type RequestEvent} from '@sveltejs/kit';
import type {PageServerLoad, PageServerLoadEvent} from './$types';
import {error} from '@sveltejs/kit';
import {auth} from '../../../auth';
import {CCC_FORM_ENABLED, DISCORD_ADMIN_ID} from '$app/env/private';

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

async function CheckAccess(event: PageServerLoadEvent | RequestEvent): Promise<string> {
    const accounts = event.locals.user ? await auth.api.listUserAccounts({
        request: event.request, 
        headers: event.request.headers, 
        asResponse: false
    }) : [];

    const discordId = accounts.find(account => account.providerId === 'discord')?.accountId;
    if (CCC_FORM_ENABLED !== 'TRUE' && discordId !== DISCORD_ADMIN_ID) error(
        403,
        'Forbidden\nThe voting form is currently disabled.'
    )

    if (!discordId) redirect(303, "/login")
    return discordId
}

function ConvertNull(s: FormDataEntryValue | null) {
    if (typeof s !== 'string') error(400, 'Invalid vote');
    if (s == '<none>') return null
    return s
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

    const vote = event.locals.db.query<Vote, [string]>(
        'SELECT * FROM votes WHERE id = ?;'
    ).get(user) ?? undefined;

    return {vote, langs: event.locals.ccc_submissions}
};
