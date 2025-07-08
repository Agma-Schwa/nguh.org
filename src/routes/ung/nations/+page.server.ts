import type {PageServerLoad} from './$types';
import {GetAllNations, GetMe, MakeBotRequest} from '$lib/js/discord';

export const load: PageServerLoad = async (event) => {
    let session = await event.locals.auth()
    return {
        nations: await GetAllNations(),
        my_nations: await MakeBotRequest<number[]>(session, 'me/nations'),
        me: await GetMe(session)
    }
}