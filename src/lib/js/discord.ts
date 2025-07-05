import { dev } from '$app/environment';
import {SERVICE_TOKEN} from '$env/static/private';
import type {Session} from '@auth/sveltekit';
import {error, redirect} from '@sveltejs/kit';


export namespace BotService {
    export interface CheckUserInGuild {
        in_guild: boolean
    }

    export interface MemberProfile {
        display_name: string,
        avatar_url: string,
        admin: boolean,
    }

    export interface IsAdmin {
        value: boolean
    }

    export type FullMemberProfile = MemberProfile & { id: string }
    export type UŊMemberList = FullMemberProfile[];
}

export const FRONTEND_API = '/ung/api';

const API_URL = "http://localhost:25000"
const deny_msg = 'Forbidden\nYou must be a member of the Agma Schwa Discord server ' +
    'to access this page.\nIf you just joined, please wait a ' +
    'few minutes before trying again. If you want to join the server, click on ' +
    'the Discord icon in the banner.\nSorry for the inconvenience, but this is one ' +
    'of the only ways to keep ourselves sane during this entire process while also preventing ' +
    'people from spamming...'

async function SendBotRequest(session: Session | null, path: string, method = 'GET', log_out_on_error: boolean = false): Promise<Response> {
    const headers: Record<string, string> = { 'Authorization': SERVICE_TOKEN }
    if (session?.user.id) headers['X-User-Id'] = session.user.id // Only used for requests requiring admin perms.
    const res = await fetch(`${API_URL}/${path}`, { method, headers })
    if (!res.ok) {
        if (log_out_on_error) {
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

        // Forward the error code from the backend.
        error(res.status, res.statusText)
    }

    return res
}

async function MakeBotRequest<T>(session: Session | null, path: string, log_out_on_error: boolean = false): Promise<T> {
    const res = await SendBotRequest(session, path, 'GET', log_out_on_error)

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
    const { in_guild } = await MakeBotRequest<BotService.CheckUserInGuild>(session, `check_user_in_guild/${session.user.id}`, true)
    if (!in_guild) error(403, deny_msg);

    // And return the ID.
    return session.user.id;
}

export async function CheckIsLoggedInAsUŊMember(session: Session | null): Promise<string> {
    // TODO: Actually check for UŊ membership.
    return await CheckIsLoggedInAsAMemberOfTheAgmaSchwaDiscordServer(session)
}

export async function AddUŊMember(session: Session, id: string): Promise<number> {
    return (await SendBotRequest(session, `admin/member/${id}`, 'PUT')).status
}

export async function DeleteUŊMember(session: Session, id: string): Promise<number> {
    return (await SendBotRequest(session, `admin/member/${id}`, 'DELETE')).status
}

export async function GetMemberProfile(id: string) {
    return await MakeBotRequest<BotService.MemberProfile>(null, `member_profile/${id}`)
}

export async function GetUŊMemberList() {
    return await MakeBotRequest<BotService.UŊMemberList>(null, `member_list`)
}

export async function IsUŊAdmin(id: string) {
    return (await MakeBotRequest<BotService.IsAdmin>(null, `is_admin/${id}`)).value;
}