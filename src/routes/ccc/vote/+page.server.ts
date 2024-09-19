import type {Actions} from "@sveltejs/kit";
import {error, redirect} from "@sveltejs/kit";

function wrap(s: FormDataEntryValue | null) {
    if (typeof s !== "string") throw error(400, "Invalid vote");
    if (s == "<none>") return null;
    return s;
}

export const actions = {
    default: async(event) => {
        // Sanity check.
        const session = await event.locals.auth()
        const email = session?.user?.email
        if (!email) throw error(401, "Not logged in");

        // Extract the vote.
        const data = await event.request.formData()

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
            wrap(data.get('top1')), // top1
            wrap(data.get('top2')), // top2
            wrap(data.get('top3')), // top3
            wrap(data.get('top4')), // top4
            wrap(data.get('top5')), // top5
            wrap(data.get('top6'))  // top6
        ])
    }
} satisfies Actions;