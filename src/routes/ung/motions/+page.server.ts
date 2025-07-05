import type {PageServerLoad} from './$types';
import {GetAllMotions, GetUŊMemberList} from '$lib/js/discord';

export const load: PageServerLoad = async (event) => {
    return { motions: await GetAllMotions(), members: await GetUŊMemberList() }
}