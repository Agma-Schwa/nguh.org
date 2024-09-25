import type {LayoutServerLoad} from "./$types";

export const load: LayoutServerLoad = (event) => ({ langs: event.locals.langs })