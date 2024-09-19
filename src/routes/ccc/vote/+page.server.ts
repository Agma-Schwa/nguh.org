import type {Actions} from "@sveltejs/kit";
import {error} from "@sveltejs/kit";

export const actions = {
    vote: async(event) => {
        // Sanity check.
        const session = await event.locals.auth()
        const email = session?.user?.email
        if (!email) throw error(401, "Not logged in");

        // Extract the vote.
        const data = await event.request.formData()
        let vals = ""
        for (const [k, v] of data.entries()) vals += `\n${k}=${v}`
        console.log(`Vote by ${email}: ${vals}`)
    }
} satisfies Actions;