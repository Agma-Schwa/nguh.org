import {GetMe} from '$lib/js/discord';

export async function load(event) {
    const session = await event.locals.auth()
    return { me: await GetMe(session) }
}