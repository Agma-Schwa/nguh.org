import type {PageLoad} from "./$types";
import {dev} from "$app/environment";
import type {Dictionary} from '$lib/js/dictionary';

export const ssr = false;

const path = dev ? "/elvish-dictionary.json" : "/static/elvish-dictionary.json";

export const load: PageLoad = async (event) => {
    const req = await event.fetch(path)
    const json = await req.json()
    return { dict: json as Dictionary.Data };
}