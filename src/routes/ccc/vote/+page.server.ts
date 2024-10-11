import type {Actions} from "@sveltejs/kit";
import type {PageServerLoad} from "./$types";
import {error} from "@sveltejs/kit";
import {CCC_FORM_ENABLED} from '$env/static/private';

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
        // Make sure the form is enabled.
        if (CCC_FORM_ENABLED !== "TRUE") throw error(403, "The voting form is currently disabled")

        // TESTING. DELETE LATER.
        process.stdout.write("Request from: " + event.locals.x_real_ip + "\n");

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
            ON CONFLICT (ip) DO UPDATE SET
                time_unix_ms = excluded.time_unix_ms,
                top1 = excluded.top1,
                top2 = excluded.top2,
                top3 = excluded.top3,
                top4 = excluded.top4,
                top5 = excluded.top5,
                top6 = excluded.top6;
        `, [
            event.locals.x_real_ip, // ip
            new Date().getTime(),   // time_unix_ms
            ...votes                // top1–top6
        ])
    }
}

export const load: PageServerLoad = async (event) => {
    // Get their previous vote.
    const vote: Vote = await new Promise(async (resolve) => {
        event.locals.db.get(
            'SELECT * FROM votes WHERE ip = ?;',
            [event.locals.x_real_ip],
            (err: Error, row: Vote) => {
                if (err) throw error(500, err)
                resolve(row)
            }
        )
    })

    // Check if the voting form is enabled.
    const enabled = CCC_FORM_ENABLED === "TRUE"
    return { vote, enabled, langs: event.locals.ccc_submissions }
}