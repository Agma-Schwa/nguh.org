import type {Actions} from "@sveltejs/kit";
import {error, redirect} from "@sveltejs/kit";

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
            email,                // email
            new Date().getTime(), // time_unix_ms
            data.get('top1'),     // top1
            data.get('top2'),     // top2
            data.get('top3'),     // top3
            data.get('top4'),     // top4
            data.get('top5'),     // top5
            data.get('top6')      // top6
        ])
    }
} satisfies Actions;