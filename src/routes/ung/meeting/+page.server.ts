import type {PageServerLoad} from './$types';
import {
    GetAllMeetings,
    GetAllMotions,
    GetCurrentMeeting,
    GetUŊMemberList,
    InAbsentiaVotingEnabled, MakeBotRequest
} from '$lib/js/discord';
import type {MeetingParticipant} from '$lib/js/ung_types';

export const load: PageServerLoad = async () => {
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

    const participants = running ? await MakeBotRequest<MeetingParticipant[]>(null, 'participants') : [];
    return { meetings, running, motions, members, absentia, participants }
}