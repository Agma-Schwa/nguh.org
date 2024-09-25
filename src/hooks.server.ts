import type {Handle} from "@sveltejs/kit";
import type {LanguagePage} from "$lib/js/types";

import * as fs from "node:fs";
import {SvelteKitAuth} from '@auth/sveltekit';
import sqlite3 from "sqlite3";
import GoogleProvider from '@auth/core/providers/google';
import {GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AUTH_SECRET} from '$env/static/private';
import {error} from "@sveltejs/kit";

// Grab all language pages.
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

const auth = SvelteKitAuth({
    providers: [GoogleProvider({
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET
    })],
    pages: {
        signIn: '/login',
        signOut: '/login',
    },
    trustHost: true,
    secret: AUTH_SECRET
})

function check(e: Error | null) {
    if (!e) return
    console.error(e)
    throw error(500)
}

export const handle: Handle = async (data) => {
    // Initialise locals.
    if (!data.event.locals.db) {
        data.event.locals.langs = langs

        // Connect to DB.
        const db = data.event.locals.db = new sqlite3.Database('www.db', check)

        // Set up tables.
        db.run(`
            CREATE TABLE IF NOT EXISTS votes (
                email TEXT PRIMARY KEY,
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

    // Handle authentication.
    return auth.handle(data)
}