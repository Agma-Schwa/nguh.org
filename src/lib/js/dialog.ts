// ====================================================================== //
//  Utils                                                                 //
// ====================================================================== //
export class HandledError extends Error {
    constructor(cause?: Error) {
        super('User should not see this.\n' +
            'This should only appear in the browser console.\n' +
            'If you can see this, please report it as a bug', {cause});
    }
}

// UserErrors behave just like Errors, except that their stack traces are
// not shown to the user when calling Dialog.error().
export class UserError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, UserError.prototype);
    }
}

function clamp(val: number, lo: number, hi: number) {
    if (lo > hi) return lo
    return val < lo ? lo : val > hi ? hi : val
}

// Clamp an x or y offset (CSS left/top) within the window.
export function ClampXOffs(xoffs: number, el: HTMLElement, window_x: number = innerWidth) {
    const border_width = el.offsetWidth - el.clientWidth
    return clamp(xoffs, window.scrollX, window_x - el.scrollWidth - border_width + window.scrollX)
}

export function ClampYOffs(yoffs: number, el: HTMLElement, window_y: number = innerHeight) {
    const border_height = el.offsetHeight - el.clientHeight
    return clamp(yoffs, window.scrollY, window_y - el.scrollHeight - border_height + window.scrollY)
}

export interface DialogPromise<T = void> {
    /**
     * Execute code if the dialog closes successfully, and ignore any
     * promise rejections.
     *
     * Use this instead of 'on_success()' if you don’t care about doing anything
     * if the uses presses the close button or 'Cancel'.
     */
    and(callback?: (t: T) => void): void

    /** Ignore promise rejections when the dialog is closed. */
    ignore_cancellation(): void

    /** Run code when the dialog closes unsuccessfully. */
    on_cancel(callback?: (reason: any) => void): DialogPromise<T>

    /** Execute code if the dialog closes successfully. */
    on_success(callback?: (t: T) => void): DialogPromise<T>

    /** Get the underlying promise so it can be awaited. */
    get promise(): Promise<T>
}

// ====================================================================== //
//  File Dialog                                                           //
// ====================================================================== //
export type FileType = 'text' | 'json' | 'raw'

export class FileDialogResult {
    readonly data: string | object | File
    readonly type: FileType
    readonly #url_saved?: string

    constructor(data: string | object | File, type: FileType, is_url: boolean = false) {
        this.data = data
        this.type = type
        if (is_url) this.#url_saved = data as string
    }

    static async Resolve(file: File, type: FileType): Promise<FileDialogResult> {
        if (type !== 'raw') {
            const text = await file.text()
            if (type === 'text') return new FileDialogResult(text, type)
            if (type === 'json')
                try { return new FileDialogResult(JSON.parse(text), type) } catch (e: any) {
                    throw (`File '${file.name}' does not appear to be a valid JSON File!\n${e?.message ?? e}`)
                }
            throw new Error('Unreachable: Invalid FileType')
        }
        return new FileDialogResult(file, type)
    }

    get url(): string {
        if (this.#url_saved) return this.#url_saved

        let blob: Blob
        switch (this.type) {
            case 'json':
                blob = new Blob([JSON.stringify(this.data as object)], {type: 'application/json'})
                break
            case 'raw':
                blob = this.data as Blob
                break
            case 'text':
                blob = new Blob([this.data as string], {type: 'text'})
                break
            default:
                throw new Error('Unreachable')
        }

        return URL.createObjectURL(blob)
    }
}

/**
 * Get the file data from a File or URL.
 *
 * @param type The type of file to get.
 * @param data The file data, if any.
 * @param url The URL to get the file data from, if any.
 * @param preserve_extern_urls Whether to return URLs as-is.
 *
 * @return null if 'data' is undefined and 'url' is undefined empty.
 * @return a FileDialogResult if there is any file data to get.
 *
 * @throws Error if the file data is invalid (e.g. if JSON parsing fails).
 */
export async function GetFileData(
    type: FileType,
    data?: File,
    url?: string,
    preserve_extern_urls: boolean = false
): Promise<FileDialogResult | null> {
    if (data) return await FileDialogResult.Resolve(data, type)
    if (!url || url === '') return null // Nothing in the text box.
    if (preserve_extern_urls) return new FileDialogResult(url, 'text', true)
    const res = await fetch(url)
    switch (type) {
        case 'raw': return new FileDialogResult(await res.blob(), type)
        case 'text': return new FileDialogResult(await res.text(), type)
        case 'json': return new FileDialogResult(await res.json(), type)
    }
}
