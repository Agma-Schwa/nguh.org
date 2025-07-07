import {
    GetCurrentMeeting,
    GetMemberProfile,
    GetMotion,
    InAbsentiaVotingEnabled,
    MakeBotRequest,
} from '$lib/js/discord';
import type {Vote} from '$lib/js/ung_types';

interface RouteParams {
    id: number
}

export async function load({ params }: { params: RouteParams }) {
    const motion = await GetMotion(params.id)
    const [
        author,
        active,
        votes,
        absentia,
    ] = await Promise.all([
        GetMemberProfile(motion.author),
        GetCurrentMeeting(),
        MakeBotRequest<Vote[]>(null, `motion/${motion.id}/votes`),
        InAbsentiaVotingEnabled(),
    ])
    return { motion, author, votes, active, absentia }
}