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
                    throw (`File '${file.name}' does not appear to be a valid JSON File: ${e?.message ?? e}`)
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

/*
Rest of old implementation; to be removed once we’ve migrated all the HGS dialogs.

export class Dialog<T = any> {
    /// This is so we can make sure that the dialogs don't end up
    /// out of bounds when we resize the window
    static readonly open_dialogs: Dialog[] = []

    /// The actual dialog.
    readonly handle: HTMLDialogElement
    get content() { return this.handle.children[1]; }


    /!** Open a new confirm dialog. *!/
    static confirm(text): DialogPromise<boolean> {
        /// Create a new dialog.
        const dialog = Dialog.make<boolean>('Warning', text, ['Yes', 'Cancel'])

        /// We'll override the 'yes' and 'cancel' buttons.
        dialog.on('Yes', d => dialog.resolve(true))
        dialog.on('Cancel', d => dialog.reject())

        /// Open it.
        document.body.appendChild(dialog.handle)
        return dialog.open()
    }

    /!** Close the topmost dialog. *!/
    static DismissTopmost() {
        if (!Dialog.open_dialogs.length) return
        Dialog.open_dialogs.pop()?.reject('User pressed ESCAPE')
    }

    static ClampOpenDialogsX(window_x) {
        for (let dialog of Dialog.open_dialogs)
            dialog.handle.style.left = ClampXOffs(dialog.handle.offsetLeft, dialog.handle, window_x) + 'px'
    }

    static ClampOpenDialogsY(window_y) {
        for (let dialog of Dialog.open_dialogs)
            dialog.handle.style.top = ClampYOffs(dialog.handle.offsetTop, dialog.handle, window_y) + 'px'
    }
}

/// Make sure we don't lose the dialogs when the window is resized.
if (browser) {
    let oldsize = [window.innerWidth, window.innerHeight]
    window.addEventListener('resize', () => {
        if (window.innerWidth < oldsize[0]) Dialog.ClampOpenDialogsX(window.innerWidth)
        if (window.innerHeight < oldsize[1]) Dialog.ClampOpenDialogsY(window.innerHeight)
        oldsize = [window.innerWidth, window.innerHeight]
    })

    /// Make sure the dialogs stay on the page when we scroll.
    let oldscroll = [window.scrollX, window.scrollY]
    window.addEventListener('scroll', e => {
        if (window.scrollX != oldscroll[0]) Dialog.ClampOpenDialogsX(window.innerWidth)
        if (window.scrollY != oldscroll[1]) Dialog.ClampOpenDialogsY(window.innerHeight)
        oldscroll = [window.scrollX, window.scrollY]
    })

    /// Intercept ESCAPE to prevent it from closing the dialog in an invalid way.
    window.addEventListener('keydown', e => { if (e.code === 'Escape') e.preventDefault() })
    window.addEventListener('keyup', e => { if (e.code === 'Escape') Dialog.DismissTopmost() })
}*/
