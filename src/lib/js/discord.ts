import { dev } from '$app/environment';
import {SERVICE_TOKEN} from '$env/static/private';
import type {Session} from '@auth/sveltekit';
import {error, redirect, type RequestEvent} from '@sveltejs/kit';
import type {BooleanProperty, MemberProfile, Motion, MotionId, MotionNoText} from './ung_types';

const API_URL = "http://localhost:25000"
const deny_msg = 'Forbidden\nYou must be a member of the Agma Schwa Discord server ' +
    'to access this page.\nIf you just joined, please wait a ' +
    'few minutes before trying again. If you want to join the server, click on ' +
    'the Discord icon in the banner.\nSorry for the inconvenience, but this is one ' +
    'of the only ways to keep ourselves sane during this entire process while also preventing ' +
    'people from spamming...'

export async function SendRequestImpl(
    session: Session | null,
    path: string,
    method = 'GET',
    body: BodyInit | null = null
) {
    const headers: Record<string, string> = { 'Authorization': SERVICE_TOKEN }
    if (session?.user.id) headers['NguhOrg-User-Id'] = session.user.id // Only used for requests requiring admin perms.
    if (body instanceof FormData) body = JSON.stringify(Object.fromEntries(body))
    if (body) headers['Content-Type'] = 'application/json';
    return await fetch(`${API_URL}/${path}`, { method, headers, body, })
}

async function SendBotRequest(
    session: Session | null,
    path: string,
    method = 'GET',
    body: BodyInit | null = null
): Promise<Response> {
    const res = await SendRequestImpl(session, path, method, body)
    if (!res.ok) {
        if (dev) console.error(await res.text())
        error(res.status, res.statusText)
    }

    return res
}

export async function MakeBotRequest<T>(
    session: Session | null,
    path: string,
    method = 'GET',
    body: BodyInit | null = null
): Promise<T> {
    const res = await SendBotRequest(session, path, method, body)

    // We're in a bit of a unique situation because we control the server and the
    // client (here, the 'client' is the webserver and the 'server' is the bot),
    // so we don't perform any client-side validation and just assume that the bot
    // always sends a well-formed response.
    return await res.json() as T
}

// ===============================================================================
//  API Routes
// ===============================================================================
export async function CheckIsLoggedInAsAMemberOfTheAgmaSchwaDiscordServer(session: Session | null): Promise<string> {
    // Ensure the user is logged in.
    if (!session || !session.user || !session.user.id) redirect(307, "/login");

    // If they are make sure they are a member of the Agma Schwa Discord server.
    const res = await SendRequestImpl(session, `check_user_in_guild/${session.user.id}`)

    // If we couldn't query this, there is something wrong w/ the login data probably; so
    // just log the user out.
    if (!res.ok) {
        // Don't log out in dev mode since that's a bit annoying.
        if (dev) {
            console.error("Logout requested")
            error(500, 'Note: Logout requested')
        }

        // Because webdevs are too fucking incompetent to actually write proper
        // software, whatever genius conceived of this authentication framework
        // thought it too much of an ask to allow us to *log someone out server-side*,
        // because why would you *ever* need that. So to fix this, redirect them
        // to a stupid intermediate page that auto-submits a form action (because
        // even triggering that from here doesn’t work because why would it).
        redirect(307, '/auto-log-out-user');
    }

    const body: BooleanProperty = await res.json()
    if (!body.value) error(403, deny_msg);

    // And return the ID.
    return session.user.id;
}

export async function CheckIsLoggedInAsUŊMember(session: Session | null): Promise<string> {
    // TODO: Actually check for UŊ membership.
    return await CheckIsLoggedInAsAMemberOfTheAgmaSchwaDiscordServer(session)
}

export async function GetMemberProfile(id: string) {
    return await MakeBotRequest<MemberProfile>(null, `member/${id}`)
}

export async function GetUŊMemberList() {
    return await MakeBotRequest<MemberProfile[]>(null, `members`)
}

export async function IsUŊAdmin(event: RequestEvent) {
    const session = await event.locals.auth()
    if (!session?.user.id) error(403, 'Should never get here w/o a valid session');
    return (await MakeBotRequest<BooleanProperty>(null, `is_admin/${session.user.id}`)).value;
}

export async function IsUŊMeetingRunning() {
    return (await MakeBotRequest<BooleanProperty>(null, `meeting/state`)).value
}

export async function GetMotion(id: number) {
    return await MakeBotRequest<Motion>(null, `motion/${id}`)
}

export async function GetAllMotions() {
    return await MakeBotRequest<MotionNoText>(null, `motions`)
}

export async function UpdateMotion(session: Session, data: FormData) {
    return (await SendBotRequest(session, 'motion', 'PATCH', data)).status
}