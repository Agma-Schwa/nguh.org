import type {PageServerLoad} from './$types';
import {GetMe, MakeBotRequest} from '$lib/js/discord';
import type {Admission, MemberProfile, Vote} from '$lib/js/ung_types';

export const load: PageServerLoad = async (event) => {
    let session = await event.locals.auth()
    return {
        admission: await MakeBotRequest<Admission>(null, `admission/${event.params.id}`),
        me: await GetMe(session),
        votes: await MakeBotRequest<Vote[]>(null, `admission/${event.params.id}/votes`),
    }
}