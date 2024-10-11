import type {Handle} from "@sveltejs/kit";
import type {LanguagePage} from "$lib/js/types";

import * as fs from "node:fs";
import sqlite3 from "sqlite3";
import {error} from "@sveltejs/kit";

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

// Grab all CCC submissions.
const ccc_submissions: string[] = fs.readFileSync('../static/ccc-langs.txt')
    .toString()
    .split('\n')
    .map(e => e.length > 50 ? `${e.slice(0, 50)}...` : e)
    .filter(e => e.length > 0)

// Sanity check: ensure we have no duplicates.
if (new Set(ccc_submissions).size !== ccc_submissions.length)
    throw new Error("Duplicate CCC submissions detected!")

function check(e: Error | null) {
    if (!e) return
    console.error(e)
    throw error(500)
}

export const handle: Handle = async ({event, resolve}) => {
    // Initialise locals.
    if (!event.locals.db) {
        event.locals.language_pages = LoadLanguagePages()
        event.locals.ccc_submissions = ccc_submissions

        // Connect to DB.
        const db = event.locals.db = new sqlite3.Database('www.db', check)

        // Set up tables.
        db.run(`
            CREATE TABLE IF NOT EXISTS votes (
                ip TEXT PRIMARY KEY,
                time_unix_ms INTEGER,
                top1 TEXT,
                top2 TEXT,
                top3 TEXT,
                top4 TEXT,
                top5 TEXT,
                top6 TEXT
            ) STRICT;
        `, check)
    }

    console.log(event.request.headers)
    event.locals.x_real_ip = event.request.headers.get('X-Real-IP') ?? event.getClientAddress()

    // Pass the request further down the chain.
    return resolve(event)
}