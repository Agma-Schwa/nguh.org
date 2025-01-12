<script lang="ts">
    import {FileDialogResult, type FileType} from "$lib/js/dialog2";
    import ErrorDialog from "$lib/components/dialog/ErrorDialog.svelte";
    import Dialog from "$lib/components/dialog/Dialog.svelte";

    let the_dialog: Dialog
    let input: HTMLInputElement
    let file_or_url = $state('')
    let uploaded_file_data: File | null  | undefined = $state(null)
    let error: Error | string = $state('')
    let error_dialog: ErrorDialog

    interface Props {
        title: string
        description?: string,
        type: FileType,
        preserve_extern_urls?: boolean
    }

    let {
        title,
        description = 'Choose a File',
        type = 'raw',
        preserve_extern_urls = false,
    }: Props = $props()

    export function open(): Promise<FileDialogResult> { return the_dialog.open() }

    async function Accept() {
        try {
            if (uploaded_file_data) return Submit(await FileDialogResult.Resolve(uploaded_file_data, type), type)
            if (file_or_url === '') return // Nothing in the text box.
            if (preserve_extern_urls) return Submit(file_or_url, 'text', true)
            const res = await fetch(file_or_url)
            switch (type) {
                case 'raw': return Submit(await res.blob(), type)
                case 'text': return Submit(await res.text(), type)
                case 'json': return Submit(await res.json(), type)
            }
        } catch (e: any) {
            error = e
            error_dialog.open()
        }
    }

    function UpdateInput(event: Event) {
        // Grab the file.
        const file = (<HTMLInputElement>event.target)?.files?.item(0)
        if (!file) return
        uploaded_file_data = file
        file_or_url = input.value.slice(input.value.lastIndexOf('\\') + 1)
    }

    function Submit(
        data: string | object | File,
        type: FileType,
        is_url: boolean = false
    ) {
        the_dialog.resolve(new FileDialogResult(data, type, is_url))
    }
</script>

<ErrorDialog {error} bind:this={error_dialog} />

<!--{#if multiple}
    <p class="ml-8" bind:this={box}></p>-->
{#snippet content()}
    <p>{description}</p>
    <div class="flex file-input-control">
        <input type="file" bind:this={input} onchange={UpdateInput}>
        <input
            type="text"
            placeholder="Enter a URL or click 'Browse Files'"
            disabled={!!uploaded_file_data}
            bind:value={file_or_url}
        >
    </div>
{/snippet}

{#snippet controls()}
    <button onclick={() => input.click()}>Browse Files</button>
    <button onclick={Accept} disabled={file_or_url === ''}>OK</button>
    <button onclick={() => the_dialog.reject('User pressed Cancel')}>Cancel</button>
{/snippet}

<Dialog
    bind:this={the_dialog}
    {title}
    {content}
    {controls}
/>

<style lang="scss">
    .file-input-control {
        gap: .55rem;
        button { width: 11.5rem; }
        input[type=file] { display: none; }
        input[type=text] {
            font-size: var(--text-size);
            width: 100%;
            padding: 0;
        }
    }
</style>
