import {error} from '@sveltejs/kit';
import type {PageServerLoad} from './$types';
import {GetUŊMemberList, IsUŊAdmin} from '$lib/js/discord';

/*export const actions: Actions = {
    add_member: async (event: RequestEvent) => {
    }
}*/

export const load: PageServerLoad = async (event) => {
    const session = await event.locals.auth()
    if (!session?.user.id) error(403, 'Should never get here w/o a valid session');
    return { members: await GetUŊMemberList(), admin: IsUŊAdmin(session.user.id) }
}