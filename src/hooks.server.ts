import { building } from '$app/env';
import type {LanguagePage} from '#lib/js/types.js';

import * as fs from 'node:fs';
import {db} from './database';
import {auth, migrateAuth} from './auth';
import {svelteKitHandler} from 'better-auth/svelte-kit';
import {sequence, type Handle} from '@sveltejs/kit/hooks';

// Grab all language pages.
function LoadLanguagePages() {
    const lang_pages = fs.readdirSync('src/routes/languages').filter(e => !e.startsWith('+')).sort()

    // Some languages have custom page names, so load those.
    const page_names = JSON.parse(fs.readFileSync('src/routes/pagename-overrides.json').toString())

    // And compose them.
    const langs: LanguagePage[] = []
    for (const page of lang_pages) {
        // If there is a page name override, use that.
        if (`/languages/${page}` in page_names) {
            langs.push({page, name: page_names[`/languages/${page}`]})
            continue
        }

        // Otherwise, convert underscores and hyphens to spaces and
        // capitalise the first letter of every word.
        langs.push({page, name: page.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())})
    }

    return langs
}

const lang_pages = Object.freeze(LoadLanguagePages())

// Grab all CCC submissions.
const CCCLangsPath = '../static/ccc-langs.txt'
const ccc_submissions = Object.freeze((fs.existsSync(CCCLangsPath) ? fs.readFileSync(CCCLangsPath) : '')
    .toString()
    .split('\n')
    .map(e => e.length > 50 ? `${e.slice(0, 50)}...` : e)
    .filter(e => e.length > 0)
)

// Sanity check: ensure we have no duplicates.
if (new Set(ccc_submissions).size !== ccc_submissions.length)
    throw new Error("Duplicate CCC submissions detected!")

const HandleSetUp: Handle = async ({event, resolve}) => {
    if (db && !event.locals.db) event.locals.db = db
    if (!event.locals.language_pages) event.locals.language_pages = lang_pages
    if (!event.locals.ccc_submissions) event.locals.ccc_submissions = ccc_submissions
    return resolve(event)
}

const CheckRouteAccess: Handle = async ({event, resolve}) => {
    // Ignore this nonsense.
    if (event.url.pathname.startsWith('/.well-known/appspecific/com.chrome.devtools'))
        return new Response(null, { status: 204 });

    return resolve(event)
}

export async function init() {
    if (!building) await migrateAuth();
}

const HandleAuth: Handle = async ({event, resolve}) => {
    event.locals.user = building ? null : (await auth.api.getSession({
        request: event.request, 
        headers: event.request.headers, 
        asResponse: false
    }))?.user ?? null;
    return svelteKitHandler({auth, event, resolve, building});
}

export const handle: Handle = sequence(CheckRouteAccess, HandleSetUp, HandleAuth);
