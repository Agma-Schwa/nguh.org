import type {PageServerLoad, PageServerLoadEvent} from './$types';
import {redirect} from '@sveltejs/kit';

async function EnsureBigLangMember(event: PageServerLoadEvent) {
    const session = await event.locals.auth()

    // Ensure the user is logged in.
    if (!session) redirect(307, '/login')

    // If they are, ensure that they’re a big lang member.
    console.log("=== JEP ===")
    console.log(session)
    /*const guilds = await fetch('https://discord.com/api/v10/users/@me/guilds', {
        headers: {
            // @ts-ignore
            'Authorization': `Bearer ${session.access_token}`
        }
    })*/
    //console.log(guilds)

}

export const load: PageServerLoad = async (event: PageServerLoadEvent) => {
    await EnsureBigLangMember(event);
}