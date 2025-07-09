import {
    GetAllMeetings,
    GetCurrentMeeting, GetMe,
    GetMemberProfile,
    GetMotion,
    InAbsentiaVotingEnabled,
    MakeBotRequest,
} from '$lib/js/discord';
import type {Vote} from '$lib/js/ung_types';

export async function load(event) {
    const session = await event.locals.auth()
    const motion = await GetMotion(Number(event.params.id))
    const [
        me,
        author,
        active,
        votes,
        absentia,
        meetings,
    ] = await Promise.all([
        GetMe(session),
        GetMemberProfile(motion.author),
        GetCurrentMeeting(),
        MakeBotRequest<Vote[]>(null, `motion/${motion.id}/votes`),
        InAbsentiaVotingEnabled(),
        GetAllMeetings(),
    ])
    return { me, motion, author, votes, active, absentia, meetings }
}