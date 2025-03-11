import type {LayoutServerLoad} from "./$types";

export const load: LayoutServerLoad = async (event) => {
    let session = await event.locals.auth()
    let user = session?.user
    return {
        user,
        language_pages: event.locals.language_pages
    }
}