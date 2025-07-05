import {error, type RequestEvent} from '@sveltejs/kit';
import {AddUŊMember, DeleteUŊMember} from '$lib/js/discord';
import {wrap} from '$lib/js/uŋ.svelte';

function ParseId(event: RequestEvent) {
    // Note: '' becomes 0, which is an invalid id.
    try { return BigInt(event.url.searchParams.get('id') ?? '') }
    catch (e) { error(400) }
}

export async function PUT(event: RequestEvent) {
    const session = await event.locals.auth() ?? error(401)
    const id = ParseId(event)
    return wrap(await AddUŊMember(session, id.toString()))
}

export async function DELETE(event: RequestEvent) {
    const session = await event.locals.auth() ?? error(401)
    const id = ParseId(event)
    return wrap(await DeleteUŊMember(session, id.toString()))
}