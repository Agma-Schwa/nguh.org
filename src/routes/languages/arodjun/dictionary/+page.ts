import type {PageLoad} from "./$types";
import type {Dictionary} from "$lib/js/dictionary";
import {dev} from "$app/environment";

export const ssr = false;

const path = dev ? "/arodjun-dictionary.json" : "/static/arodjun-dictionary.json";

export const load: PageLoad = async (event) => {
    const req = await event.fetch(path)
    const json = await req.json()
    return { dict: json as Dictionary.Data };
}