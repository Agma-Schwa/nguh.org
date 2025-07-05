import type {PageServerLoad} from './$types';
import {GetAllMeetings, GetAllMotions, GetCurrentMeeting, GetUŊMemberList} from '$lib/js/discord';

export const load: PageServerLoad = async (event) => {
    return {
        meetings: await GetAllMeetings(),
        running: await GetCurrentMeeting(),
        motions: await GetAllMotions(),
        members: await GetUŊMemberList(),
    }
}