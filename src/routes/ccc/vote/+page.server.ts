import type {Actions} from "@sveltejs/kit";
import type {PageServerLoad} from "./$types";
import {error, redirect} from "@sveltejs/kit";
import {CCC_FORM_ENABLED} from '$env/static/private';
import * as fs from 'fs';

interface Vote {
    email: string,
    time_unix_ms: number,
    top1: string | null,
    top2: string | null,
    top3: string | null,
    top4: string | null,
    top5: string | null,
    top6: string | null
}

function ConvertNull(s: FormDataEntryValue | null) {
    if (typeof s !== "string") throw error(400, "Invalid vote")
    if (s == "<none>") return null
    return s
}

export const actions: Actions = {
    default: async(event) => {
        // Make sure the user is logged in.
        const session = await event.locals.auth()
        const email = session?.user?.email
        if (!email) throw redirect(303, "/ccc/login")

        // Make sure the form is enabled.
        if (CCC_FORM_ENABLED !== "TRUE") throw error(403, "The voting form is currently disabled")

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
                throw error(400, `You cannot vote for '${vote}' more than once!`)

        // Save it to the db.
        event.locals.db.run(`
            INSERT INTO votes VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (email) DO UPDATE SET
                time_unix_ms = excluded.time_unix_ms,
                top1 = excluded.top1,
                top2 = excluded.top2,
                top3 = excluded.top3,
                top4 = excluded.top4,
                top5 = excluded.top5,
                top6 = excluded.top6;
        `, [
            email,                  // email
            new Date().getTime(),   // time_unix_ms
            ...votes                // top1–top6
        ])
    }
}

export const load: PageServerLoad = async (event) => {
    // Make sure the user is logged in.
    const session = await event.locals.auth()
    if (!session) throw redirect(307, "/ccc/login")

    // Get their previous vote.
    const vote: Vote = await new Promise(async (resolve) => {
        event.locals.db.get(
            'SELECT * FROM votes WHERE email = ?;',
            [session.user?.email],
            (err: Error, row: Vote) => {
                if (err) throw error(500, err)
                resolve(row)
            }
        )
    })

    // Grab the languages.
    const langs = JSON.parse(fs.readFileSync('static/ccc-langs.json').toString())

    // Check if the voting form is enabled.
    const enabled = CCC_FORM_ENABLED === "TRUE"
    return { session, vote, enabled, langs }
}