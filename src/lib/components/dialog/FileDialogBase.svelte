<script lang="ts">
    import Dialog from "$lib/components/dialog/Dialog.svelte";
    import {FileDialogResult, type FileType} from "$lib/js/dialog2";

    interface Props {
        title: string
        description: string
        multiple: boolean,
        ok_callback: () => void,
        on_file_selected: (event: Event) => void,
        children: import('svelte').Snippet
    }

    let {
        title,
        description = 'Choose a File',
        multiple,
        ok_callback,
        on_file_selected,
        children,
    }: Props = $props()

    let the_dialog: Dialog
    let input: HTMLInputElement

    export function get_input(): HTMLInputElement { return input }
    export function open(): Promise<any> { return the_dialog.open() }
    export function submit(data: string | object | File, type: FileType, is_url: boolean = false) {
        the_dialog.close(new FileDialogResult(data, type, is_url))
    }
</script>

<Dialog {title} controls={['Browse Files', 'OK', 'Cancel']} bind:this={the_dialog} callbacks={{
    OK: ok_callback,
    'Browse Files': () => input.click()
}}>
    <p>{description}</p>
    <div class="flex file-input-control">
        <input type="file" {multiple} bind:this={input} onchange={on_file_selected}>
        <!--{#if multiple}
            <p class="ml-8" bind:this={box}></p>-->
        {@render children()}
    </div>
</Dialog>

<style lang="scss">
    .file-input-control {
        gap: .55rem;
        button { width: 11.5rem; }
        input[type=file] { display: none; }
    }
</style>