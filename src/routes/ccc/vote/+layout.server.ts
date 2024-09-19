import {error, redirect} from "@sveltejs/kit";
import type {LayoutServerLoad} from "./$types";
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

export const load: LayoutServerLoad = async (event) => {
    // Make sure the user is logged in.
    const session = await event.locals.auth();
    if (!session) throw redirect(307, "/ccc/login");

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

    // Check if the voting form is enabled.
    const enabled = CCC_FORM_ENABLED === "TRUE";
    return { session, vote, enabled }
}