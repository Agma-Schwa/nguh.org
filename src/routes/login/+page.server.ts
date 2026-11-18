import { error, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { auth } from '../../auth';

export const actions: Actions = {
    login: async ({ request }) => {
        const { url } = await auth.api.signInSocial({
            request,
            asResponse: false,
            body: { provider: 'discord', callbackURL: '/login', errorCallbackURL: '/login' }
        });
        if (!url) error(502, 'Could not start Discord sign-in');
        redirect(303, url, { external: ['https://discord.com'] });
    },
    logout: async ({ request }) => {
        await auth.api.signOut({ request, headers: request.headers, asResponse: false });
        redirect(303, '/login');
    }
};
