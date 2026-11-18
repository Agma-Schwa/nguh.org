<script lang="ts">
    import {ClampXOffs, ClampYOffs, type DialogPromise} from "#lib/js/dialog.svelte.js";

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

    // This is implemented here rather than in dialog.ts so we can directly
    // reference the reactive properties of this dialog (e.g. in the ctor).
    class DialogPromiseImpl<T> implements DialogPromise<T> {
        readonly __handle: Promise<T>
        resolve: (value?: any) => void = () => {}
        reject: (reason?: any) => void = () => {}

        and(callback?: (t: T) => void): void { this.__handle.then(callback).catch(_ => {}) }
        ignore_cancellation() { this.on_cancel(() => {}) }

        on_cancel(callback?: (reason: any) => void): DialogPromise<T> {
            this.__handle.catch(callback)
            return this
        }

        on_success(callback?: (t: T) => void): DialogPromise<T> {
            this.__handle.then(callback)
            return this
        }

        get promise(): Promise<T> { return this.__handle }

        constructor() {
            let that = this
            this.__handle = new Promise<T>((resolve, reject) => {
                that.resolve = (value?: any) => {
                    the_promise = undefined
                    resolve(value)
                    the_dialog.close()
                }

                that.reject = (reason?: any) => {
                    the_promise = undefined
                    reject(reason)
                    the_dialog.close()
                }
            })
        }
    }

    let the_dialog: HTMLDialogElement
    let the_promise: DialogPromiseImpl<any> | undefined
    $effect(() => {
        if (title_colours) {
            let s = the_dialog.style
            s.setProperty(CSSKey.TITLE_COL, title_colours.normal);
            s.setProperty(CSSKey.TITLE_TEXT_COL, title_colours.text);
            s.setProperty(CSSKey.SVG_BTN_COL, title_colours.normal);
            s.setProperty(CSSKey.SVG_BTN_COL_HOV, title_colours.hover);
        }
    })

    export function open(): DialogPromise<any> {
        if (the_promise !== undefined) throw Error("Cannot open dialog because it is already open!")
        the_promise = new DialogPromiseImpl<any>()

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
        return the_promise
    }

    export function reject(reason?: any) {
        the_promise?.reject(reason)
    }

    export function resolve(value?: any) {
        the_promise?.resolve(value)
    }

    function OnClose() {
        the_promise?.reject("Closed by user")
    }

    function StartDrag(e: MouseEvent) {
        if (e.target instanceof Element && e.target.closest('button')) return
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
        /** Dialog title. */
        title: string,

        /** HTML id of the dialog. */
        id?: string

        /** Colours to use for the dialog title bar. */
        title_colours?: {
            normal: string
            hover: string
            text: string
        }

        /** Dialog buttons. */
        controls: import('svelte').Snippet

        /** Extra data to be added to the dialog body. */
        content?: import('svelte').Snippet
    }

    let {
        title,
        id,
        title_colours,
        content,
        controls
    }: Props = $props()
</script>

<dialog {id} bind:this={the_dialog} onclose={OnClose} class="modal absolute top-1/2 bottom-auto! left-1/2 right-auto! z-98 w-fit min-w-[min(50ch,90vw)] max-w-[90vw] max-h-[90dvh]
        flex-col justify-between [border:1px_solid_var(--bg-border)] bg-(--accentblack) p-0 text-(length:--text-size) text-white
        [box-shadow:10px_10px_2em_rgb(0_0_0/.5)] not-open:hidden! backdrop:bg-[rgb(0_0_0/.5)]
        [--title-bar-colour:var(--accentlight)] [--title-bar-text-colour:var(--accentdarker)]
        [--svg-button-bg:var(--title-bar-colour)] [--svg-button-hover-bg:var(--accentcolour)]">
    <div class="relative z-99 m-0 flex h-10 w-full justify-end bg-(--title-bar-colour) p-0 text-center
            text-(--title-bar-text-colour) select-none [-webkit-user-drag:element]" role="presentation" onmousedown={StartDrag}>
        <div class="absolute top-1/2 left-1/2 w-fit -translate-x-1/2 -translate-y-1/2">{title}</div>
        <button type="button" class="h-full bg-transparent! p-0!" title="Close" aria-label="Close" onclick={() => the_promise?.reject("Closed by user")}>
            <svg class="pointer-events-auto h-full bg-(--svg-button-bg) fill-(--title-bar-text-colour) hover:bg-(--svg-button-hover-bg)" width="1cm" height="1cm" viewBox="0 0 100 100"
                 xmlns="http://www.w3.org/2000/svg">
                <path d="M 40 38 L 62 60 L 60 62 L 38 40"></path>
                <path d="M 60 38 L 38 60 L 40 62 L 62 40"></path>
            </svg>
        </button>
    </div>
    <div class="flex flex-col gap-3 overflow-y-auto px-4 pt-4 pb-2 [&_p]:my-0!">
        {@render content?.()}
    </div>
    <div class="flex flex-wrap justify-evenly gap-2 p-4 [&_button]:min-w-20">
        {@render controls()}
    </div>
</dialog>
