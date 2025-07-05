import {error, type RequestEvent} from '@sveltejs/kit';
import {UpdateMotion} from '$lib/js/discord';
import {wrap} from '$lib/js/uŋ.svelte';
/*

export async function PATCH(event: RequestEvent) {
    const session = await event.locals.auth() ?? error(401);
    wrap(await UpdateMotion(session, event.request))
}*/
