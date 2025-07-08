import type {PageServerLoad} from './$types';
import {GetAllNations, GetMe, GetMyNations} from '$lib/js/discord';

export const load: PageServerLoad = async (event) => {
    let session = await event.locals.auth()
    return {
        nations: await GetAllNations(),
        my_nations: await GetMyNations(session),
        me: await GetMe(session)
    }
}