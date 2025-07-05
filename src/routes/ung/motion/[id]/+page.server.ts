import {GetCurrentMeeting, GetMemberProfile, GetMotion, MakeBotRequest, UpdateMotion} from '$lib/js/discord';
import {type Actions, error, redirect, type RequestEvent} from '@sveltejs/kit';
import type {Vote} from '$lib/js/ung_types';

interface RouteParams {
    id: number
}

export const actions: Actions = {
    async default(event: RequestEvent) {
        const session = await event.locals.auth() ?? error(401);
        const data = await event.request.formData()
        const params = event.params as unknown as RouteParams
        data.set('id', params.id.toString())
        await UpdateMotion(session, data);
        return { success: true }
    }
}

export async function load({ params }: { params: RouteParams }) {
    const motion = await GetMotion(params.id)
    const author = await GetMemberProfile(motion.author)
    const active = await GetCurrentMeeting()
    const votes = await MakeBotRequest<Vote[]>(null, `motion/${motion.id}/votes`)
    return { motion, author, votes, active }
}