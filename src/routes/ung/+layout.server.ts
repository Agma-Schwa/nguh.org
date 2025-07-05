import type {LayoutServerLoad} from './$types';
import {IsUŊAdmin} from '$lib/js/discord';

export const load: LayoutServerLoad = async (event) => {
    return { admin: await IsUŊAdmin(event) }
}