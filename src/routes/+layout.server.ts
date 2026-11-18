import type {LayoutServerLoad} from "./$types";

export const load: LayoutServerLoad = ({locals}) => ({
    user: locals.user ? {name: locals.user.name} : null,
    language_pages: locals.language_pages
})
