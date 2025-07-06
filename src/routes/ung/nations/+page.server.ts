import type {PageServerLoad} from './$types';
import {GetAllNations} from '$lib/js/discord';

export const load: PageServerLoad = async (event) => {
    return {
        nations: await GetAllNations()
    }
}