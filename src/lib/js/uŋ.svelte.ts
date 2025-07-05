import {browser} from '$app/environment';

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