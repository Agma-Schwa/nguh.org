import type {PageServerLoad} from './$types';
import {IsUŊMeetingRunning} from '$lib/js/discord';

export const load: PageServerLoad = async () => {
    return { running: await IsUŊMeetingRunning() }
}