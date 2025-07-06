import {error, type RequestEvent} from '@sveltejs/kit';
import {dev} from '$app/environment';
import {SendRequestImpl} from '$lib/js/discord';

export async function POST(event: RequestEvent) {
    // Make sure the user is logged in.
    const session = await event.locals.auth() ?? error(401);

    // Get the actual request path and method.
    const path = event.request.headers.get('NguhOrg-Real-Path')
    const method = event.request.headers.get('NguhOrg-Real-Method')
    if (!path || !method) error(400)

    // Log requests in dev mode.
    const body = event.request.body ? JSON.stringify(await event.request.json()) : null;
    if (dev) {
        console.log(`Forwarding ${method} to ${path}`)
        if (body) console.log(`    Body: ${body}`)
    }

    const res = await SendRequestImpl(session, path, method, body);

    // Log the response.
    if (dev) console.log(`    --> ${res.status}`)

    // For some reason, responses returned by fetch() are immutable, so
    // create a new one instead.
    return new Response(res.body, { status: res.status });
}