import type {LayoutServerLoad} from "./$types";

export const load: LayoutServerLoad = (event) => ({ language_pages: event.locals.language_pages })