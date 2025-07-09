import {GetCurrentMeeting} from '$lib/js/discord';

export async function load() {
    return { active: await GetCurrentMeeting() }
}