import type {PageServerLoad} from './$types';
import {MakeBotRequest} from '$lib/js/discord';
import type {Admission} from '$lib/js/ung_types';

export const load: PageServerLoad = async (event) => {
    return {
        admissions: await MakeBotRequest<Admission[]>(null, 'admissions'),
    }
}