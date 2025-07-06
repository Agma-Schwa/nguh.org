<script lang="ts">
    import {
        type DialogPromise,
        FileDialogResult,
        type FileType,
        GetFileData,
        Err
    } from '$lib/js/dialog.svelte';
    import Dialog from "$lib/components/dialog/Dialog.svelte";

    let the_dialog: Dialog
    let input: HTMLInputElement
    let uploaded_files: File[] = $state([])

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

    export function open(): DialogPromise<FileDialogResult[]> {
        uploaded_files = []
        return the_dialog.open()
    }

    async function Accept() {
        try {
            const data = await Promise.all(uploaded_files.map(f => GetFileData(type, f, undefined, preserve_extern_urls)))
            if (data.length !== 0) the_dialog.resolve(data)
        } catch (e: any) {
            Err(e)
        }
    }

    function UpdateInput(event: Event) {
        const files = (<HTMLInputElement>event.target)?.files
        if (!files || files.length === 0) return
        uploaded_files = [...files]
    }
</script>

{#snippet content()}
    <p>{description}</p>
    <div class="flex file-input-control">
        <input type="file" multiple bind:this={input} onchange={UpdateInput}>
        <p class="ml-4">
            {#each uploaded_files.slice(0, 10) as file}
                {file.name}<br>
            {/each}
            {#if uploaded_files.length > 10}
                ...
            {/if}
        </p>
    </div>
{/snippet}

{#snippet controls()}
    <button onclick={() => input.click()}>Browse Files</button>
    <button onclick={Accept} disabled={uploaded_files.length === 0}>OK</button>
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
        input[type=file] { display: none; }
    }
</style>
