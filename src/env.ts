import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
    AUTH_DISCORD_ID: { static: true },
    AUTH_DISCORD_SECRET: { static: true },
    AUTH_SECRET: { static: true },
    CCC_FORM_ENABLED: { static: true },
    DISCORD_ADMIN_ID: { static: true }
});
