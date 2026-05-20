import type {PageLoad} from "./$types";
import {dev} from "$app/environment";

export const ssr = false;

const path = dev ? "/ULTRAFRENCH.dict.txt" : "/static/ULTRAFRENCH.dict.txt";

export const load: PageLoad = async (event) => {
    const req = await event.fetch(path)
    const text = await req.text()
    return { dict: text };
}