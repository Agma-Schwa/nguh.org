/// ====================================================================== ///
///  Dialog implementation                                                 ///
/// ====================================================================== ///
export class Dialog<T = any> {
    /// This is so we can make sure that the dialogs don't end up
    /// out of bounds when we resize the window
    static readonly open_dialogs: Dialog[] = []

    /// The close button in the title bar.
    // @ts-ignore
    static readonly close_button_template = !browser ? null :  new DOMParser().parseFromString(`<div class="dialog-close-button" title="Close">
        <svg class="close-button-icon" width="1cm" height="1cm" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M 40 38 L 62 60 L 60 62 L 38 40"/>
            <path d="M 60 38 L 38 60 L 40 62 L 62 40"/>
        </svg>
    </div>`, 'text/html').body.children[0].cloneNode(true) as HTMLDivElement

    /// What action to take when a control is pressed.
    readonly __actions: Map<DialogControl, DialogAction<T>> = new Map()

    /// The controls that the dialog has.
    readonly __controls: Map<DialogControl, HTMLElement> = new Map()

    /// This depends on the type of dialog.
    __data: InternalDialogData<T>

    /// The actual dialog.
    readonly handle: HTMLDialogElement

    /// Whether this dialog should be removed from the DOM when it's closed.
    readonly ephemeral: boolean

    /** Wrap a DOM dialog. */
    constructor(handle: HTMLDialogElement, controls: DialogButton[] = [], ephemeral: boolean = true) {
      // DONE
    }

    get content() { return this.handle.children[1]; }

    /** Take an action when a control is pressed. */
    on(control: DialogControl, action: DialogAction<T>) {
        if (!this.__controls.has(control)) throw new Error(`Cannot add action to control '${control}' because the dialog does not have that control.`)
        this.__actions.set(control, action)

        let that = this
        ;(<HTMLElement>this.__controls.get(control)).onclick = (e) => action(that)
    }

    /** Open a new confirm dialog. */
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

    /** Close the topmost dialog. */
    static DismissTopmost() {
        if (!Dialog.open_dialogs.length) return
        Dialog.open_dialogs.pop()?.reject('User pressed ESCAPE')
    }

    /** Open a new error dialog. */
    static error(e: string | Error, title: string = 'Error') { Dialog.__error(e, title, true).catch() }

    /** Open a new file dialog. */
    static file(title: string, options: FileDialogOptions): DialogPromise<FileDialogResult> {
        return Dialog.MakeFileDialog(title, options).open()
    }

    /** Open a new file dialog. */
    static files(title: string, options: FileDialogOptions): DialogPromise<MultiFileDialogResult> {
        return Dialog.MakeMultiFileDialog(title, options).open()
    }

    /** Create a new file dialog without opening it. */
    static MakeFileDialog(title: string, options: FileDialogOptions): Dialog<FileDialogResult> {
        /// Initialise the dialog.
        const dialog = Dialog.__mk_fdlog<FileDialogResult>(title, options)

        /// Create the controls.
        const {input, box} = Dialog.__mk_fdlog_ctrls(dialog);
        const textbox = box as HTMLInputElement
        input.onchange = (event) => {
            textbox.value = input.value.slice(input.value.lastIndexOf('\\') + 1)
            if (!event.target) return

            dialog.__data.file = (<HTMLInputElement>event.target)?.files?.item(0) ?? ''
            if (dialog.__data.file === '') return

            dialog.__data.is_file = true
            textbox.disabled = true
        }

        /// Initialise the dialog data.
        dialog.__data = {
            file: '',
            preserve_extern_urls: options.preserve_extern_urls ?? false,
            textbox,
            type: options.type ?? FileType.RAW,
            is_file: false,
        }

        /// Get the file (content) if the user has selected one when 'OK' is clicked.
        dialog.on('OK', async d => {
            try {
                const data = d.__data;
                if (!data.is_file) data.file = data.textbox.value

                /// The data has already been uploaded.
                if (typeof data.file !== 'string') {
                    d.resolve(new FileDialogResult(await Dialog.__fdata(data.file, data.type), data.type))
                    return
                }

                /// The data is a URL.
                else if (data.textbox.value) {
                    if (data.preserve_extern_urls) return d.resolve(new FileDialogResult(data.file, FileType.TEXT, true))

                    const res = await fetch(data.textbox.value)
                    switch (data.type) { /// @formatter:off
                        case FileType.TEXT: return d.resolve(new FileDialogResult(await res.text(), FileType.TEXT))
                        case FileType.JSON:
                            try { return d.resolve(new FileDialogResult(await res.json(), FileType.JSON)) }
                            catch (e) { await Dialog.error(`<p>File '${data.textbox.value}' does not appear to be a valid JSON File</p><p>${e.message}</p>`) }
                        case FileType.RAW: return d.resolve(new FileDialogResult(await res.blob(), FileType.RAW))
                        default: throw new Error('Unreachable: Invalid FileType')
                    } /// @formatter:on
                }

                /// Otherwise do nothing and leave the dialog open.
                else {}
            } catch (e) {
                await Dialog.error(e)
                if (e.message.startsWith('Unreachable')) d.reject(e.message)
            }
        })

        return dialog
    }

    /** Create a new multi file dialog without opening it. */
    static MakeMultiFileDialog(title: string, options: FileDialogOptions): Dialog<MultiFileDialogResult> {
        /// Initialise the dialog.
        const dialog = Dialog.__mk_fdlog<MultiFileDialogResult>(title, options)

        /// Create the controls.
        const {input, box} = Dialog.__mk_fdlog_ctrls(dialog, true);
        const par = box as HTMLParagraphElement
        input.onchange = (event) => {
            if (!event.target) return
            dialog.__data.files = (<HTMLInputElement>event.target)?.files

            /// Display the selected files (at most 10).
            if (dialog.__data.files && dialog.__data.files.length) {
                let files = ''
                for (let i = 0; i < dialog.__data.files.length; i++) {
                    if (files.length) files += '<br>'
                    files += (dialog.__data.files.item(i) as File).name
                    if (i === 9 && dialog.__data.files.length > 10) {
                        files += `<br>... (${dialog.__data.files.length - 10} more)`
                        break
                    }
                }
                dialog.__data.par.innerHTML = files
            }
        }

        /// Initialise the dialog data.
        dialog.__data = {
            files: null,
            par,
            type: options.type ?? FileType.RAW,
        }

        /// Get the file (content) if the user has selected one when 'OK' is clicked.
        dialog.on('OK', async d => {
            try {
                const data = d.__data;
                if (!data.files) return

                /// We have a file list.
                const files: (string | object | Blob)[] = []
                for await (const file of [...data.files].map(f => Dialog.__fdata(f, data.type))) files.push(file)
                d.resolve({files: files as string[] | object[] | Blob[], type: data.type})
                return
            } catch (e) {
                await Dialog.error(e)
                if (e.message.startsWith('Unreachable')) d.reject(e.message)
            }
        })

        return dialog
    }

    static ClampOpenDialogsX(window_x) {
        for (let dialog of Dialog.open_dialogs)
            dialog.handle.style.left = ClampXOffs(dialog.handle.offsetLeft, dialog.handle, window_x) + 'px'
    }

    static ClampOpenDialogsY(window_y) {
        for (let dialog of Dialog.open_dialogs)
            dialog.handle.style.top = ClampYOffs(dialog.handle.offsetTop, dialog.handle, window_y) + 'px'
    }

    static async __error(e: string | Error, title: string = 'Error', show_help: boolean) {
        /// DONE
    }

    static async __fdata(file: File, type: FileType): Promise<string | object | File> {
        if (type !== FileType.RAW) {
            const text = await file.text()
            if (type === FileType.TEXT) return text
            if (type === FileType.JSON)
                try { return JSON.parse(text) } catch (e) {
                    await Dialog.error(`<p>File '${file.name}' does not appear to be a valid JSON File</p><p>${e.message}</p>`)
                    throw new HandledError(e)
                }
            throw new Error('Unreachable: Invalid FileType')
        }
        return file
    }

    static __mk_fdlog_ctrls<T>(dialog: Dialog<T>, multiple: boolean = false): { input: HTMLInputElement, box: HTMLInputElement | HTMLParagraphElement } {

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
}
