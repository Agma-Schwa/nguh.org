import type {PageLoad} from "./$types";
import type {Dictionary} from "$lib/js/dictionary";
import {dev} from "$app/environment";

export const ssr = false;

const path = dev ? "/arodjun-dictionary.json" : "/static/arodjun-dictionary.json";

export const load: PageLoad = async (event) => {
    return { dict: await (event.fetch(path).then((r) => r.json()) as Promise<Dictionary>) }
}