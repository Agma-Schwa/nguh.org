import {error, type RequestEvent} from '@sveltejs/kit';
import {wrap} from '$lib/js/uŋ.svelte';
import {EndMeeting, StartMeeting} from '$lib/js/discord';

export async function PUT(event: RequestEvent) {
    const session = await event.locals.auth() ?? error(401)
    return wrap(await StartMeeting(session))
}

export async function DELETE(event: RequestEvent) {
    const session = await event.locals.auth() ?? error(401)
    return wrap(await EndMeeting(session))
}