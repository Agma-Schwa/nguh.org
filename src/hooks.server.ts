import type {Handle} from "@sveltejs/kit";

import {SvelteKitAuth} from '@auth/sveltekit';
import sqlite3 from "sqlite3";
import GoogleProvider from '@auth/core/providers/google';
import {GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET} from '$env/static/private';
import {error} from "@sveltejs/kit";

const auth = SvelteKitAuth({
    providers: [GoogleProvider({
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET
    })],
    pages: {
        signIn: '/login',
        signOut: '/login',
    }
})

function check(e: Error | null) {
    if (!e) return
    console.error(e)
    throw error(500)
}

export const handle: Handle = async (data) => {
    // Initialise DB.
    if (!data.event.locals.db) {
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