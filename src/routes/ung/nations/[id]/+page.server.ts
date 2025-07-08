import type {RouteParams} from './$types';
import {MakeBotRequest} from '$lib/js/discord';
import type {Nation, NationMemberProfile} from '$lib/js/ung_types';

export async function load({ params }: { params: RouteParams }) {
    const nation = await MakeBotRequest<Nation>(null, `nation/${params.id}`)
    const reps = await MakeBotRequest<NationMemberProfile[]>(null, `nation/${params.id}/representatives`)
    return { nation, reps }
}