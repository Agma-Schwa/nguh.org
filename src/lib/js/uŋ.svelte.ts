import {browser} from '$app/environment';
import type {LockPageRequestBody} from '$lib/js/ung_types';
import {invalidateAll} from '$app/navigation';

export function wrap(status: number): Response {
    return new Response(null, { status: status })
}

export function EnableAdminMode() {
    return (browser ? !new URLSearchParams(window.location.search).has('noadmin') : true)
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export async function UŊMakeRequest(
    backend_path: string,
    method: Method = 'GET',
    data: object | null = null
): Promise<Response> {
    return fetch('/ung/api', {
        method: 'POST',
        body: data ? JSON.stringify(data) : null,
        headers: {
            'NguhOrg-Real-Path': backend_path,
            'NguhOrg-Real-Method': method,
        },
    })
}

export async function LockMotion(motion: number, locked: boolean) {
    const res = await UŊMakeRequest('admin/motion/lock', 'PATCH', {
        id: motion,
        locked,
    } satisfies LockPageRequestBody)

    if (res.ok) await invalidateAll();
    else console.error(`Failed to lock motion: ${res.status} ${await res.text()}`)
}