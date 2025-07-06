import type {Handle} from "@sveltejs/kit";
import type {LanguagePage} from "$lib/js/types";

import * as fs from "node:fs";
import sqlite3 from "sqlite3";
import {error} from "@sveltejs/kit";
import {ENABLE_DATABASES} from '$env/static/private';
import { handle as HandleAuth } from './auth';
import {sequence} from '@sveltejs/kit/hooks';
import {CheckIsLoggedInAsUŊMember} from '$lib/js/discord';

const EnableDBs = ENABLE_DATABASES === 'TRUE'

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

function check(e: Error | null) {
    if (!e) return
    console.error(e)
    error(500);
}

// Connect to DB.
const db = SetUpDB()
function SetUpDB() {
    const db = new sqlite3.Database('www.db', check)

    // Set up tables.
    db.run(`
        CREATE TABLE IF NOT EXISTS votes (
            id TEXT PRIMARY KEY,
            time_unix_ms INTEGER,
            top1 TEXT,
            top2 TEXT,
            top3 TEXT,
            top4 TEXT,
            top5 TEXT,
            top6 TEXT
        ) STRICT;
    `, check)

    db.run(`
        CREATE TABLE IF NOT EXISTS ung_members (
            id TEXT PRIMARY KEY
        ) STRICT;
    `)

    return db
}

const HandleSetUp: Handle = async ({event, resolve}) => {
    if (!event.locals.db) event.locals.db = db
    if (!event.locals.language_pages) event.locals.language_pages = lang_pages
    if (!event.locals.ccc_submissions) event.locals.ccc_submissions = ccc_submissions
    return resolve(event)
}

const CheckRouteAccess: Handle = async ({event, resolve}) => {
    // Ignore this nonsense.
    if (event.url.pathname.startsWith('/.well-known/appspecific/com.chrome.devtools'))
        return new Response(null, { status: 204 });

    if (event.url.pathname.startsWith('/ung'))
        await CheckIsLoggedInAsUŊMember(await event.locals.auth())

    return resolve(event)
}

export const handle: Handle = sequence(HandleSetUp, HandleAuth, CheckRouteAccess);