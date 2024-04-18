import type {Actions} from "../../../../.svelte-kit/types/src/routes";
import {fail} from "@sveltejs/kit";
import {SPEEDRUN_POST_URL} from "$env/static/private";

const categories = [
    "Original+Dice%",
    "Original+Any%",
]

/// Cache for rate limiting.
const MAX_ATTEMPTS_PER_HOUR = 2
const cache = new Map<string, number[]>()

export const actions = {
    submit: async (request_data) => {
        /// Validate method.
        const request = request_data.request
        if (request.method !== 'POST') return fail(405)

        /// Check cache.
        const ip = request_data.getClientAddress()
        const now = Date.now()
        const entry = cache.get(ip)
        if (!entry) cache.set(ip, [now])
        else {
            /// Clean up old entries.
            while (entry.length > 0 && entry[0] < now - 3600000) entry.shift()

            /// Check if the user has exceeded the limit.
            if (entry.length >= MAX_ATTEMPTS_PER_HOUR) {
                if (entry.length < 10) entry.push(now)
                return fail(429)
            }

            /// Add the entry.
            entry.push(now)
        }

        /// Get params.
        const data = await request.formData()
        if (
            !data.has('username') ||
            !data.has('id') ||
            !data.has('hh') ||
            !data.has('mm') ||
            !data.has('ss') ||
            !data.has('category') ||
            !data.has('url')
        ) {
            return fail(400)
        }

        /// Validate params.
        const username = (data.get('username') as string).trim()
        const id = (data.get('id') as string).trim()
        const hh = parseInt((data.get('hh') as string).trim(), 10)
        const mm = parseInt((data.get('mm') as string).trim(), 10)
        const ss = parseInt((data.get('ss') as string).trim(), 10)
        const category = (data.get('category') as string).trim()
        const url = (data.get('url') as string).trim()
        if (
            username.length < 1 ||
            isNaN(hh) ||
            isNaN(mm) ||
            isNaN(ss) ||
            !categories.includes(category) ||
            url.length < 1
        ) {
            return fail(400)
        }

        /// Make a post request to the discord bot.
        try {
            const res = await fetch(SPEEDRUN_POST_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    id,
                    hh,
                    mm,
                    ss,
                    category,
                    url
                })
            })

            /// Validate response.
            if (res.status >= 400 && res.status < 500) {
                return fail(400)
            } else if (res.status >= 500) {
                return fail(500)
            }
        } catch (e) {
            return fail(500)
        }

        return {
            success: true
        }
    }
} satisfies Actions