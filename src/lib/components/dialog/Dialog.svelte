<script lang="ts">
    // ====================================================================== //
    //  Utils                                                                 //
    // ====================================================================== //
    function clamp(val: number, lo: number, hi: number) {
        if (lo > hi) return lo
        return val < lo ? lo : val > hi ? hi : val
    }

    // Clamp an x or y offset (CSS left/top) within the window.
    function ClampXOffs(xoffs: number, el: HTMLElement, window_x: number = innerWidth) {
        const border_width = el.offsetWidth - el.clientWidth
        return clamp(xoffs, window.scrollX, window_x - el.scrollWidth - border_width + window.scrollX)
    }

    function ClampYOffs(yoffs: number, el: HTMLElement, window_y: number = innerHeight) {
        const border_height = el.offsetHeight - el.clientHeight
        return clamp(yoffs, window.scrollY, window_y - el.scrollHeight - border_height + window.scrollY)
    }

    // ====================================================================== //
    //  Types & Interfaces                                                    //
    // ====================================================================== //
    const enum CSSKey {
        TITLE_COL = '--title-bar-colour',
        TITLE_TEXT_COL = '--title-bar-text-colour',
        SVG_BTN_COL = '--svg-button-bg',
        SVG_BTN_COL_HOV = '--svg-button-hover-bg',
        SVG_BTN_TFILL = '--svg-button-transparent-fill',
        SVG_BTN_TFILL_HOV = '--svg-button-hover-transparent-fill',
    }

    type DialogCallbacks = {
        'Yes'?: () => void
        'No'?: () => void
        'Cancel'?: () => void
        'Apply'?: () => void
        'OK'?: () => void
        'Add'?: () => void
        'Browse Files'?: () => void
    }

    class DialogPromise<T> {
        readonly __handle: Promise<T>
        resolve: () => void = () => {}
        reject: (reason?: any) => void = () => {}
        return_value: any = undefined

        /** Same as Promise<T>.then(callback, () => {}). */
        and(callback?: (t: T) => void): void { this.__handle.then(callback).catch(_ => {}) }

        /** Ignore promise rejections */
        catch(): DialogPromise<T> {
            this.__handle.catch(_ => {})
            return this
        }

        /** Same as Promise<T>.then(callback). */
        then(callback?: (t: T) => void) { return this.__handle.then(callback) }

        constructor() {
            let that = this
            this.__handle = new Promise<T>((resolve, reject) => {
                that.resolve = () => {
                    the_dialog.close()
                    resolve(this.return_value)
                }

                that.reject = (reason?: any) => {
                    the_dialog.close()
                    reject(reason)
                }
            })
        }
    }

    let the_dialog: HTMLDialogElement
    let the_promise: DialogPromise<any> | undefined
    $effect(() => {
        if (title_colours) {
            let s = the_dialog.style
            s.setProperty(CSSKey.TITLE_COL, title_colours.normal);
            s.setProperty(CSSKey.TITLE_TEXT_COL, title_colours.text);
            s.setProperty(CSSKey.SVG_BTN_COL, title_colours.normal);
            s.setProperty(CSSKey.SVG_BTN_COL_HOV, title_colours.hover);
        }
    })

    export function close(value: any = undefined) {
        if (the_promise === undefined) return // Dialog is already closed.
        the_promise.return_value = value
        the_dialog.close()
    }

    export function open(): Promise<any> {
        if (the_promise !== undefined) throw Error("Cannot open dialog because it is already open!")
        the_promise = new DialogPromise<any>()
        if (ignore_exceptions) the_promise.catch()
        the_dialog.showModal()

        // Set the dialog's position to the top left corner of the visible screen so that the page
        // doesn't scroll and so that the dialog has is maximum size when it is first made visible.
        the_dialog.style.left = ClampXOffs(window.scrollX, the_dialog) + 'px'
        the_dialog.style.top = ClampYOffs(window.scrollY, the_dialog) + 'px'

        // Show the dialog.
        the_dialog.style.display = 'flex';
        the_dialog.showModal()

        // Correct the position now that we know the dialog's width and height.
        the_dialog.style.left = ClampXOffs(innerWidth / 2 - the_dialog.scrollWidth / 2 + window.scrollX, the_dialog) + 'px'
        the_dialog.style.top = ClampYOffs(innerHeight / 2 - the_dialog.scrollHeight / 2 + window.scrollY, the_dialog) + 'px'
        return the_promise.__handle
    }

    export function set_return_value(value: any) {
        if (the_promise !== undefined) the_promise.return_value = value
    }

    function OnClose() {
        the_promise?.reject("Closed by user")
        the_promise = undefined;
    }

    function StartDrag(e: MouseEvent) {
        e.preventDefault()

        // Position where we start dragging.
        let x_drag_start = e.clientX
        let y_drag_start = e.clientY

        // Move the element when the mouse moves. Stop dragging when we
        // release the element.
        document.addEventListener('mouseup', _StopDragging)
        document.addEventListener('mousemove', _DoDrag)

        // Move the element.
        function _DoDrag(e: MouseEvent) {
            e.preventDefault()

            // The x/y distance we need to move.
            const xdelta = x_drag_start - e.clientX
            const ydelta = y_drag_start - e.clientY

            // The new top/left position
            // Make sure we don't drag the element outside the window
            let new_x_offs = ClampXOffs(the_dialog.offsetLeft - xdelta, the_dialog)
            let new_y_offs = ClampYOffs(the_dialog.offsetTop - ydelta, the_dialog);

            // The current position becomes the new start position.
            x_drag_start = e.clientX
            y_drag_start = e.clientY

            // Move the element.
            the_dialog.style.top = new_y_offs + 'px'
            the_dialog.style.left = new_x_offs + 'px'
        }

        // Stop dragging when the element is released.
        function _StopDragging() {
            document.removeEventListener('mouseup', _StopDragging)
            document.removeEventListener('mousemove', _DoDrag)
        }
    }

    // ====================================================================== //
    //  API                                                                   //
    // ====================================================================== //
    interface Props {
        title: string,
        controls?: (keyof DialogCallbacks)[]
        id?: string
        callbacks? : DialogCallbacks
        ignore_exceptions?: boolean
        children?: import('svelte').Snippet
        title_colours?: {
            normal: string
            hover: string
            text: string
        }
    }

    let {
        title,
        controls = ['OK'],
        id,
        callbacks,
        ignore_exceptions = true,
        title_colours,
        children
    }: Props = $props()
</script>

<dialog {id} bind:this={the_dialog} class="modal" onclose={OnClose}>
    <div class="dialog-title" onmousedown={StartDrag}>
        <div class="dialog-title-content">{title}</div>
        <div class="dialog-close-button" title="Close" onclick={close}>
            <svg class="close-button-icon" width="1cm" height="1cm" viewBox="0 0 100 100"
                 xmlns="http://www.w3.org/2000/svg">
                <path d="M 40 38 L 62 60 L 60 62 L 38 40"></path>
                <path d="M 60 38 L 38 60 L 40 62 L 62 40"></path>
            </svg>
        </div>
    </div>
    <div class="dialog-content">
        {@render children?.()}
    </div>
    <div class="dialog-controls">
        {#if controls.includes('Browse Files')}
            <button onclick={callbacks?.['Browse Files'] ?? (() => {})}>Browse Files</button>
        {/if}
        {#if controls.includes('OK')}
            <button onclick={callbacks?.OK ?? (() => the_promise?.resolve())}>OK</button>
        {/if}
        {#if controls.includes('Cancel')}
            <button onclick={callbacks?.Cancel ?? (() => the_promise?.reject('Closed by user'))}>Cancel</button>
        {/if}
    </div>
</dialog>

<style lang="scss">
    @use 'sass:color';
    @use '$lib/css/vars' as *;

    $bg-colour: #2D2A2E;
    $bg-darker: color.adjust($bg-colour, $lightness: -10%);
    $bg-accent: color.adjust($bg-colour, $lightness: 10%);
    $fg-colour: #FCFCFA;
    $border: 1px solid var(--bg-border);

    .dialog-spaced > * + * { margin-top: 1rem; }

    dialog:not([open]) {
        display: none !important;
    }

    dialog {
        position: absolute;
        z-index: 98;
        top: 50%;
        left: 50%;
        bottom: auto !important;
        right: auto !important;

        flex-direction: column;
        justify-content: space-between;

        border: $border;
        box-shadow: 10px 10px 2em rgba(0, 0, 0, .5);
        padding: 0;
        max-width: 90vw;
        min-width: 50ch;
        width: fit-content;

        background: $accentblack;
        color: $fg-colour;
        font-size: var(--text-size);

        --title-bar-colour: #{$accentlight};
        --title-bar-text-colour: #{$accentdarker};
        --svg-button-bg: var(--title-bar-colour);
        --svg-button-hover-bg: #{$accentcolour};

        &::backdrop { background: rgba(0, 0, 0, .5); }
        & > *, fieldset { padding: .5rem; }
        fieldset + fieldset { margin-top: 1rem; }

        fieldset {
            width: fit-content;
            border: 1px solid var(--accentlighter);
        }

        select {
            border: none;
            background-color: var(--accentlight);
            color: var(--accentdarker);
            font-size: var(--text-size);
            transition: background-color .5s, color .5s;

            &:hover {
                background: var(--accentcolour);
                color: white;
            }
        }

        input {
            &[disabled] { background: lightgrey; }
            &[type=number] {
                width: 5rem;
                border: none;
                font-size: var(--text-size);
            }
        }

        pre {
            word-wrap: break-word;
            overflow-x: auto;
            white-space: pre-wrap;
        }

        h5 {
            display: block;
            margin-bottom: 0;
            padding: .5rem;

            background: $accentblack;
            text-align: center;
            font-size: calc(var(--text-size) * 1.1);
        }

        .dialog {
            &-close-button, &-close-button * { height: 100%; }

            &-content {
                display: flex;
                flex-direction: column;
                gap: .75rem;

                padding: 1rem 1rem .5rem;
                overflow-y: auto;

                p { margin-block: 0; }
                p + p { margin-block-start: -.5rem; }
            }

            &-controls {
                display: flex;
                flex-direction: row;
                justify-content: space-evenly;
                padding: 1rem;
            }

            &-title {
                -webkit-user-select: none;
                -webkit-user-drag: element;

                position: relative;
                z-index: 99;

                display: flex;
                flex-direction: row;
                justify-content: flex-end;

                margin: 0;
                padding: 0;
                width: 100%;
                height: 2.5rem;

                background: var(--title-bar-colour);
                text-align: center;
                color: var(--title-bar-text-colour);

                &-content {
                    position: absolute;
                    top: 50%;
                    left: 50%;

                    width: fit-content;
                    transform: translate(-50%, -50%);
                }

                svg.close-button-icon {
                    pointer-events: auto;
                    background: var(--svg-button-bg);
                    &:hover { background: var(--svg-button-hover-bg); }
                }

                * { fill: var(--title-bar-text-colour); }
            }
        }
    }


    .form-wrapper {
        display: flex;
        margin-top: 3rem;

        align-content: center;
        justify-content: center;
    }

    form {
        display: flex;
        margin: 0 auto;
        gap: 1rem;
        flex-direction: column;

        label { margin-bottom: -.75rem; }

        input {
            border: 1px solid $accentcolour;
            font-size: var(--text-size);
            padding-inline: 2px;

            &[disabled] { background-color: #ddd; }
            &[type=submit] {
                @include button;
                min-width: 7rem;
            }
        }

        select, option {
            background: $accentlight;
            color: $accentdarker;
            border: 1px solid $accentcolour;
            font-size: var(--text-size);
        }

        .disabled { color: #aaa; }

        .submit-wrapper {
            display: flex;
            margin-top: 1rem;
            justify-content: flex-end;
        }

        .row {
            display: flex;
            flex-direction: row;
        }
    }
</style>