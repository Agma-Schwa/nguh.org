import {type Actions, error, redirect, type RequestEvent} from '@sveltejs/kit';
import {CreateMotion} from '$lib/js/discord';

export const actions: Actions = {
    async default(event: RequestEvent) {
        const session = await event.locals.auth() ?? error(401);
        const data = await event.request.formData()
        console.log(data)
        const res = await CreateMotion(session, data);
        return { redirect: true, status: 303, location: `/ung/motion/${res.id}` }
    }
}