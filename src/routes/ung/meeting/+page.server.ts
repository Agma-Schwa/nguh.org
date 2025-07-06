import type {PageServerLoad} from './$types';
import {
    GetAllMeetings,
    GetAllMotions,
    GetCurrentMeeting,
    GetUŊMemberList,
    InAbsentiaVotingEnabled
} from '$lib/js/discord';

export const load: PageServerLoad = async (event) => {
    const [
        meetings,
        running,
        motions,
        members,
        absentia
    ] = await Promise.all([
        GetAllMeetings(),
        GetCurrentMeeting(),
        GetAllMotions(),
        GetUŊMemberList(),
        InAbsentiaVotingEnabled(),
    ])

    return { meetings, running, motions, members, absentia }
}