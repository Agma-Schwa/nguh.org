import type {Actions} from './$types';
import {signOut} from '../../auth';
import {redirect} from '@sveltejs/kit';

export const prerender = false;
export const ssr = false;

// Stupid hack. See the code for the CCC voting page.
export const actions: Actions = {
    logout: async (e) => {
        const session = await e.locals.auth()
        if (session) await signOut(e)

        // 303 because this is a POST request, but we need to convert it to a GET request.
        redirect(303, "/login")
    }
}