import { AUTH_DISCORD_ID, AUTH_DISCORD_SECRET, AUTH_SECRET } from '$app/env/private';
import { getRequestEvent } from '$app/server';
import { betterAuth } from 'better-auth';
import { getMigrations } from 'better-auth/db/migration';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { db } from './database';

export const auth = betterAuth({
    database: db,
    baseURL: {
        allowedHosts: ['nguh.org', 'www.nguh.org', 'localhost:*', '127.0.0.1:*'],
        fallback: 'https://www.nguh.org'
    },
    basePath: '/auth',
    secret: AUTH_SECRET,
    account: {
        accountLinking: { enabled: false },
        encryptOAuthTokens: true
    },
    socialProviders: {
        discord: {
            clientId: AUTH_DISCORD_ID,
            clientSecret: AUTH_DISCORD_SECRET,
            disableDefaultScope: true,
            scope: ['identify'],
            // Discord sign-in only needs the account ID. Supply the email field
            // Better Auth requires without asking Discord for the user's email.
            mapProfileToUser: ({ id }) => ({ email: `${id}@discord.invalid`, emailVerified: false })
        }
    },
    plugins: [sveltekitCookies(getRequestEvent)]
});

export async function migrateAuth() {
    const { runMigrations } = await getMigrations(auth.options);
    await runMigrations();
}
