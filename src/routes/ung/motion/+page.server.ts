import {type Actions, error, redirect, type RequestEvent} from '@sveltejs/kit';
import {MakeBotRequest} from '$lib/js/discord';
import type {I32} from '$lib/js/ung_types';

export const actions: Actions = {
    async default(event: RequestEvent) {
        const session = await event.locals.auth() ?? error(401);
        const data = await event.request.formData()
        const res = await MakeBotRequest<I32>(session, 'motion', 'POST', data)
        redirect(303, `/ung/motion/${res.value}`)
    }
}