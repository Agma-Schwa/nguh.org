import {type DefaultSession, SvelteKitAuth} from '@auth/sveltekit';
import Discord from "@auth/sveltekit/providers/discord"

declare module "@auth/sveltekit" {
  interface Session {
    access_token: string | undefined,
    user: {
      /**
       * By default, TypeScript merges new interface properties and overwrites existing ones.
       * In this case, the default session user properties will be overwritten,
       * with the new ones defined above. To keep the default session user properties,
       * you need to add them back into the newly declared interface.
       */
    } & DefaultSession["user"]
  }
}

export const { handle, signIn, signOut } = SvelteKitAuth({
    providers: [Discord({
        authorization: {
            params: {
                scope: "identify guilds"
            }
        }
    })],
    callbacks: {
        async jwt({token, account, profile, user}) {
            // During sign-in, 'user' is set; this is when we need to save the access_token etc.
            if (user) return { ...token, access_token: account?.access_token, discord_id: profile?.id }

            // Otherwise, we’re fetching an existing token, so take care not to override it.
            return token
        },

        async session({token, session}) {
            session.access_token = token.access_token as string
            session.user.id = token.discord_id as string
            return session
        }
    }
})