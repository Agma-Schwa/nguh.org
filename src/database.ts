import { building } from '$app/env';
import { Database } from 'bun:sqlite';

export const db = building ? undefined : new Database('www.db');

if (db) {
    db.exec(`
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
    `);
}
