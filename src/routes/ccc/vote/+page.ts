import type {PageLoad} from "./$types";

export const load: PageLoad = async (event) => {
    const langs = await event.fetch("/ccc-langs.json").then(r => r.json());
    return { langs };
}

