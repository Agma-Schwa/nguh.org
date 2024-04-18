import { FormatError } from "./trace.js";

/// ====================================================================== ///
///  Utils                                                                 ///
/// ====================================================================== ///

function clamp(val, lo, hi) {
    if (lo > hi) return lo
    return val < lo ? lo : val > hi ? hi : val
}

/// Clamp an x or y offset (CSS left/top) within the window.
function ClampXOffs(xoffs, el, window_x = innerWidth) {
    const border_width = el.offsetWidth - el.clientWidth
    return clamp(xoffs, window.scrollX, window_x - el.scrollWidth - border_width + window.scrollX)
}

function ClampYOffs(yoffs, el, window_y = innerHeight) {
    const border_height = el.offsetHeight - el.clientHeight
    return clamp(yoffs, window.scrollY, window_y - el.scrollHeight - border_height + window.scrollY)
}

export class HandledError extends Error {
    constructor(cause?: Error) {
        super('User should not see this.\n' +
            'This should only appear in the browser console.\n' +
            'If you can see this, please report it as a bug', {cause});
    }
}

/// UserErrors behave just like Errors, except that their stack traces are
/// not shown to the user when calling Dialog.error().
export class UserError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, UserError.prototype);
    }
}

/// ====================================================================== ///
///  Types & Interfaces                                                    ///
/// ====================================================================== ///

export type DialogButton = 'Yes' | 'No' | 'Cancel' | 'Apply' | 'OK' | 'Add' | 'Browse Files'
export type DialogControl = DialogButton | '__CLOSE__'
export type DialogAction<T> = (d: Dialog<T>) => void

export enum FileType {
    TEXT,
    JSON,
    RAW,
}

export interface FileDialogOptions {
    description?: string
    preserve_extern_urls?: boolean
    type?: FileType
}

export class FileDialogResult {
    readonly data: string | object | File
    readonly type: FileType
    url_saved?: string

    constructor(data: string | object | File, type: FileType, is_url: boolean = false) {
        this.data = data
        this.type = type
        if (is_url) this.url_saved = data as string
    }

    get url(): string {
        if (this.url_saved) return this.url_saved

        let blob: Blob
        switch (this.type) {
            case FileType.JSON:
                blob = new Blob([JSON.stringify(this.data as object)], {type: 'application/json'})
                break
            case FileType.RAW:
                blob = this.data as Blob
                break
            case FileType.TEXT:
                blob = new Blob([this.data as string], {type: 'text'})
                break
            default:
                throw new Error('Unreachable')
        }

        return URL.createObjectURL(blob)
    }
}

interface FileDialogData {
    file: File | string
    preserve_extern_urls: boolean
    textbox: HTMLInputElement
    type: FileType
    is_file: boolean
}

interface MultiFileDialogResult {
    readonly files: string[] | object[] | File[]
    readonly type: FileType
}

interface MultiFileDialogData {
    files: FileList | null
    par: HTMLParagraphElement
    type: FileType
}

type InternalDialogData<T> = T extends FileDialogResult
    ? FileDialogData
    : T extends MultiFileDialogResult
        ? MultiFileDialogData
        : any

const enum CSSKey {
    TITLE_COL = '--title-bar-colour',
    TITLE_TEXT_COL = '--title-bar-text-colour',
    SVG_BTN_COL = '--svg-button-bg',
    SVG_BTN_COL_HOV = '--svg-button-hover-bg',
    SVG_BTN_TFILL = '--svg-button-transparent-fill',
    SVG_BTN_TFILL_HOV = '--svg-button-hover-transparent-fill',
}

/// ====================================================================== ///
///  Dialog implementation                                                 ///
/// ====================================================================== ///
export class DialogPromise<T> {
    readonly __dialog: Dialog<T>
    readonly __handle: Promise<T>
    __resolve: (value: T) => void
    __reject: (reason?: any) => void

    /** Same as Promise<T>.then(callback, () => {}). */
    and(callback?: (t: T) => void): void { this.__handle.then(callback).catch(ignored => {}) }

    /** Ignore promise rejections */
    catch(): DialogPromise<T> {
        this.__handle.catch(ignored => {})
        return this
    }

    /** Same as Promise<T>.then(callback). */
    then(callback?: (t: T) => void) { return this.__handle.then(callback) }

    constructor(dialog: Dialog<T>) {
        let that = this
        this.__dialog = dialog
        this.__handle = new Promise<T>((resolve, reject) => {
            that.__resolve = (value: T) => {
                that.__dialog.__have_promise = false
                resolve(value)
            }

            that.__reject = (reason?: any) => {
                that.__dialog.__have_promise = false
                reject(reason)
            }

            that.__dialog.__have_promise = true
        })
    }
}

export class Dialog<T = any> {
    /// This is so we can make sure that the dialogs don't end up
    /// out of bounds when we resize the window
    static readonly open_dialogs: Dialog[] = []

    /// The close button in the title bar.
    static readonly close_button_template = new DOMParser().parseFromString(`<div class="dialog-close-button" title="Close">
        <svg class="close-button-icon" width="1cm" height="1cm" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M 40 38 L 62 60 L 60 62 L 38 40"/>
            <path d="M 60 38 L 38 60 L 40 62 L 62 40"/>
        </svg>
    </div>`, 'text/html').body.children[0].cloneNode(true) as HTMLDivElement

    static readonly __button_names: string[] = ['Yes', 'No', 'Cancel', 'Apply', 'OK']

    /// Functions to run when this dialog is opened.
    readonly __atopen: DialogAction<T>[] = []

    /// What action to take when a control is pressed.
    readonly __actions: Map<DialogControl, DialogAction<T>> = new Map()

    /// The controls that the dialog has.
    readonly __controls: Map<DialogControl, HTMLElement> = new Map()

    /// This depends on the type of dialog.
    __data: InternalDialogData<T>

    /// Promise handles.
    __promise: DialogPromise<T>
    __have_promise: boolean = false

    /// The actual dialog.
    readonly handle: HTMLDialogElement

    /// Whether this dialog should be removed from the DOM when it's closed.
    readonly ephemeral: boolean

    /** Wrap a DOM dialog. */
    constructor(handle: HTMLDialogElement, controls: DialogButton[] = [], ephemeral: boolean = true) {
        this.handle = handle
        this.ephemeral = ephemeral

        /// Get the close button.
        let close_button = this.handle.getElementsByClassName('dialog-close-button');
        if (close_button.length) {
            this.__controls.set('__CLOSE__', close_button.item(0) as HTMLElement)
            this.on('__CLOSE__', () => this.reject('Closed by user'))
        }

        /// Get any other preexisting controls.
        let buttons = this.handle.getElementsByTagName('button')
        for (const button of buttons) {
            const text = button.innerText
            if (text in Dialog.__button_names) this.__controls.set(text as DialogButton, button)
        }

        /// Add the controls, if any.
        if (controls.length) {
            /// Controls Wrapper.
            const existing_controls = this.handle.querySelector('.dialog-controls')
            const controls_element = existing_controls ?? document.createElement('div')
            if (!existing_controls) {
                controls_element.className = 'dialog-controls'
                handle.appendChild(controls_element)
            }

            /// Create the controls.
            for (const control_name of controls) {
                if (this.__controls.has(control_name)) throw Error(`Duplicate control ${control_name}`)
                const control = document.createElement('button')
                control.innerText = control_name
                controls_element.appendChild(control)
                this.__controls.set(control_name, control)
            }
        }

        /// Make the dialog draggable.
        MakeDraggable(handle, handle.getElementsByTagName('div')[0])
    }

    get content() { return this.handle.children[1]; }

    /** Run a function every time this dialog is opened. */
    AtOpen(fun: (d: Dialog<T>) => void) { this.__atopen.push(fun) }

    /** Close this dialog. */
    close() {
        this.handle.close()
        this.handle.style.display = 'none';
        Dialog.open_dialogs.splice(Dialog.open_dialogs.indexOf(this), 1)
        if (this.ephemeral) this.handle.remove()
    }

    /** Take an action when a control is pressed. */
    on(control: DialogControl, action: DialogAction<T>) {
        if (!this.__controls.has(control)) throw new Error(`Cannot add action to control '${control}' because the dialog does not have that control.`)
        this.__actions.set(control, action)

        let that = this
        ;(<HTMLElement>this.__controls.get(control)).onclick = (e) => action(that)
    }

    /** Open this dialog. */
    open(): DialogPromise<T> {
        /// Create a new promise.
        if (this.__have_promise) this.reject('reopened')
        this.__promise = new DialogPromise<T>(this)

        /// Set the dialog's position to the top left corner of the visible screen so that the page
        /// doesn't scroll and so that the dialog has is maximum size when it is first made visible.
        this.handle.style.left = ClampXOffs(window.scrollX, this.handle) + 'px'
        this.handle.style.top = ClampYOffs(window.scrollY, this.handle) + 'px'

        /// Show the dialog.
        this.handle.style.display = 'flex';
        this.handle.showModal()

        /// Correct the position now that we know the dialog's width and height.
        this.handle.style.left = ClampXOffs(innerWidth / 2 - this.handle.scrollWidth / 2 + window.scrollX, this.handle) + 'px'
        this.handle.style.top = ClampYOffs(innerHeight / 2 - this.handle.scrollHeight / 2 + window.scrollY, this.handle) + 'px'

        /// Run registered hooks.
        for (let f of this.__atopen) f(this)

        Dialog.open_dialogs.push(this)
        return this.__promise
    }

    /** Reject the promise currently associated with this dialog. */
    reject(reason?: any) {
        this.close()
        this.__promise.__reject(reason)
    }

    /** Resolve the promise currently associated with this dialog. */
    resolve(value: T) {
        this.close()
        this.__promise.__resolve(value)
    }

    /** Set the title bar colour. */
    TitleColour(normal: string, hover: string, text: string) {
        let s = this.handle.style
        s.setProperty(CSSKey.TITLE_COL, normal);
        s.setProperty(CSSKey.TITLE_TEXT_COL, text);
        s.setProperty(CSSKey.SVG_BTN_COL, normal);
        s.setProperty(CSSKey.SVG_BTN_COL_HOV, hover);
    }

    /** Create a new DOM <dialog> with a title, contents, controls, and ID */
    static make<T = any>(title: string, content: string | Node | null, controls: DialogButton[] = [], id?: string, ephemeral: boolean = true): Dialog<T> {
        /// Create the dialog element.
        const handle = document.createElement('dialog')
        handle.className = 'modal'
        document.body.appendChild(handle)

        /// Add the id if we've specified one.
        if (typeof id === 'string') handle.id = id

        /// Add the title bar.
        const title_bar = document.createElement('div')
        title_bar.className = 'dialog-title'
        handle.appendChild(title_bar)

        /// Title bar text.
        const title_bar_text = document.createElement('div')
        title_bar_text.className = 'dialog-title-content'
        title_bar_text.innerHTML = title
        title_bar.appendChild(title_bar_text)

        /// Close button.
        const close_button = Dialog.close_button_template.cloneNode(true) as HTMLDivElement
        title_bar.appendChild(close_button)

        /// Content.
        const content_element = document.createElement('div')
        content_element.className = 'dialog-content'
        handle.appendChild(content_element)

        if (typeof content === 'string') content_element.innerHTML = content
        else if (typeof content === 'object' && content) content_element.appendChild(content)

        /// Create the dialog.
        return new Dialog(handle, controls, ephemeral)
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
    static error(e: string | Error, title: string = 'Error') { Dialog.__error(e, title).catch() }

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

    static async __error(e: string | Error, title: string = 'Error') {
        /// Also log the error to the console.
        console.error(e)

        /// Don't display the same error twice.
        if (e instanceof HandledError) return;

        /// Create a new dialog.
        const dialog = Dialog.make<void>('Error', null, ['OK'])
        dialog.on('OK', () => dialog.resolve())
        dialog.content.classList.add('error-dialog-content')

        /// Set the text.
        dialog.content.innerHTML = typeof e === 'string' || e instanceof UserError ? `<p>${e}</p>` : FormatError(e)

        /// Make the title bar red.
        dialog.TitleColour('var(--accentred)', 'var(--accentred-dark)', 'white')

        /// Open it.
        document.body.appendChild(dialog.handle)
        await dialog.open().catch()
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

    static __mk_fdlog<T>(title: string, options: FileDialogOptions): Dialog<T> {
        return Dialog.make<T>(title,
            options.description ? options.description : 'Choose a file',
            ['Browse Files', 'OK', 'Cancel'])
    }

    static __mk_fdlog_ctrls<T>(dialog: Dialog<T>, multiple: boolean = false): { input: HTMLInputElement, box: HTMLInputElement | HTMLParagraphElement } {
        let row = document.createElement('div')
        let input = document.createElement('input')
        row.classList.add('dialog-element', 'flex-row', 'file-input-control')
        input.type = 'file'
        input.multiple = multiple

        /// Update the current file when the button is clicked.
        dialog.on('Browse Files', () => input.click())

        /// Do nothing if the user clicks 'Cancel'.
        dialog.on('Cancel', () => dialog.reject('User clicked \'Cancel\''))

        /// Append the elements.
        row.appendChild(input)
        dialog.content.append(row)

        /// Append a textbox if this is a single file dialog.
        if (!multiple) {
            let box = document.createElement('input')
            box.type = 'text'
            box.placeholder = 'Enter a URL or click \'Browse files\''
            row.appendChild(box)
            return {input, box}
        }

        /// Otherwise, append an empty paragraph.
        else {
            const par = document.createElement('p')
            par.className = 'mgl2rem'
            row.appendChild(par)
            return {input, box: par}
        }
    }
}

/// Make `container` move when the user clicks on and drags `header`.
function MakeDraggable(container, header) {
    /// Move `container` when we click and drag `header`
    header.addEventListener('mousedown', drag)

    /// This does most of the actual work.
    function drag(e) {
        e.preventDefault()

        /// Position where we start dragging.
        let x_drag_start = parseInt(e.clientX)
        let y_drag_start = parseInt(e.clientY)

        /// Move the element when the mouse moves. Stop dragging when we
        /// release the element.
        document.addEventListener('mouseup', stop_dragging)
        document.addEventListener('mousemove', do_drag)

        /// Move the element.
        function do_drag(e) {
            e.preventDefault()

            /// The x/y distance we need to move.
            const xdelta = x_drag_start - parseInt(e.clientX)
            const ydelta = y_drag_start - parseInt(e.clientY)

            /// The new top/left position
            /// Make sure we don't drag the element outside the window
            let new_x_offs = ClampXOffs(container.offsetLeft - xdelta, container)
            let new_y_offs = ClampYOffs(container.offsetTop - ydelta, container);

            /// The current position becomes the new start position.
            x_drag_start = parseInt(e.clientX)
            y_drag_start = parseInt(e.clientY)

            /// Move the element.
            container.style.top = new_y_offs + 'px'
            container.style.left = new_x_offs + 'px'
        }

        /// Stop dragging when the element is released.
        function stop_dragging() {
            document.removeEventListener('mouseup', stop_dragging)
            document.removeEventListener('mousemove', do_drag)
        }
    }
}

/// Make sure we don't lose the dialogs when the window is resized.
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