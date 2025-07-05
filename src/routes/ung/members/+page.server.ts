import type {PageServerLoad} from './$types';
import {GetUŊMemberList} from '$lib/js/discord';

export const load: PageServerLoad = async (event) => {
    return { members: await GetUŊMemberList() }
}