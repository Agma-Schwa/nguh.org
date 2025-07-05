import {type Actions, error, type RequestEvent} from '@sveltejs/kit';
import {MakeBotRequest} from '$lib/js/discord';
import type {MotionId} from '$lib/js/ung_types';

export const actions: Actions = {
    async default(event: RequestEvent) {
        const session = await event.locals.auth() ?? error(401);
        const data = await event.request.formData()
        console.log(data)
        const res = await MakeBotRequest<MotionId>(session, 'motion', 'POST', data)
        return { redirect: true, status: 303, location: `/ung/motion/${res.id}` }
    }
}