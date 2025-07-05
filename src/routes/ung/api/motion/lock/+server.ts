import {error, type RequestEvent} from '@sveltejs/kit';
import {wrap} from '$lib/js/uŋ.svelte';
import {SetMotionLock} from '$lib/js/discord';

export async function PATCH(event: RequestEvent) {
    const session = await event.locals.auth() ?? error(401)
    return wrap(await SetMotionLock(session, event.request))
}