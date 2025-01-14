<script lang="ts">
    import {FileDialogResult, type FileType, GetFileData} from "$lib/js/dialog";
    import ErrorDialog from "$lib/components/dialog/ErrorDialog.svelte";
    import Dialog from "$lib/components/dialog/Dialog.svelte";

    let the_dialog: Dialog
    let input: HTMLInputElement
    let file_or_url = $state('')
    let uploaded_file_data: File | undefined = $state(undefined)
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

    export function open(): Promise<FileDialogResult> {
        file_or_url = ''
        uploaded_file_data = undefined
        return the_dialog.open()
    }

    async function Accept() {
        try {
            const data = await GetFileData(type, uploaded_file_data, file_or_url, preserve_extern_urls)
            if (data) the_dialog.resolve(data)
        } catch (e: any) {
            error = e
            error_dialog.open()
        }
    }

    function UpdateInput(event: Event) {
        const file = (<HTMLInputElement>event.target)?.files?.item(0)
        if (!file) return
        uploaded_file_data = file

        // Note: Browsers support fake Windows-style paths.
        file_or_url = input.value.slice(input.value.lastIndexOf('\\') + 1)
    }
</script>

<ErrorDialog {error} bind:this={error_dialog} />

{#snippet content()}
    <p>
        {#each description.split('\n') as line}
            {line}<br>
        {/each}
    </p>
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
