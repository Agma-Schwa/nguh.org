import {browser} from '$app/environment';
import {invalidateAll} from '$app/navigation';
import type {Motion, MotionNoText} from '$lib/js/ung_types';
import {Err} from '$lib/js/dialog.svelte';
import markdownit from 'markdown-it'
import type {Action} from 'svelte/action';
import {enhance} from '$app/forms';

export function wrap(status: number): Response {
    return new Response(null, { status: status })
}

export function EnableAdminMode() {
    return (browser ? !new URLSearchParams(window.location.search).has('noadmin') : true)
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type FormSubmitData = { cancel: () => void, formElement: HTMLFormElement }

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

export async function UŊMakeRequestAndCheckErr(
    backend_path: string,
    method: Method = 'GET',
    data: object | null = null
) {
    const res = await UŊMakeRequest(backend_path, method, data);
    if (res.ok) await invalidateAll()
    else Err(`Error ${res.status} ${res.statusText}: ${await res.text()}`);
}

export async function LockMotion(motion: number, locked: boolean) {
    await UŊMakeRequestAndCheckErr(`admin/motion/${motion}/lock/${locked ? 1 : 0}`, 'PATCH')
}

export async function EnableMotion(motion: number, enabled: boolean) {
    await UŊMakeRequestAndCheckErr(`admin/motion/${motion}/enable/${enabled ? 1 : 0}`, 'PATCH')
}

export function GetEmoji(m: MotionNoText): string {
    if (m.supported || (m.passed && m.type !== 'Constitutional')) return '✅'
    if (m.passed) return '⌛'
    if (m.closed) return '❌'
    if (m.locked) return '🔒'
    return ''
}

export const form: Action<HTMLFormElement, (form: HTMLFormElement) => void> = (
    form,
    cb
) => enhance(form, ({ cancel, formElement} : FormSubmitData) => {
    cancel()
    if (!formElement.reportValidity()) return
    cb(formElement)
})

export const MarkdownInstance = markdownit({
    html: false,
    linkify: true,
    typographer: true,
})