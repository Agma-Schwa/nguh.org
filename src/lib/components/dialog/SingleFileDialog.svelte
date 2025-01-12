<script lang="ts">
    import FileDialogBase from "$lib/components/dialog/FileDialogBase.svelte";
    import {type FileDialogData, FileDialogResult, type FileType} from "$lib/js/dialog2";
    import ErrorDialog from "$lib/components/dialog/ErrorDialog.svelte";

    let textbox: HTMLInputElement
    let base: FileDialogBase
    let file: string | File
    let is_file: boolean
    let error: Error | string = $state('')
    let error_dialog: ErrorDialog

    interface Props {
        title: string
        description?: string,
        type?: FileType,
        preserve_extern_urls?: boolean
    }

    let {
        title,
        description = 'Choose a File',
        type = 'raw',
        preserve_extern_urls = false,
    }: Props = $props()

    $effect(() => {
        file = ''
        is_file = false
    })

    export function open(): Promise<FileDialogResult> { return base.open() }

    async function Accept() {
        try {
            if (is_file) return base.submit(await FileDialogResult.Resolve(file as File, type), type)
            if (textbox.value === '') return // Nothing in the text box.
            if (preserve_extern_urls) return base.submit(file, 'text', true)
            const res = await fetch(textbox.value)
            switch (type) {
                case 'raw': return base.submit(await res.blob(), type)
                case 'text': return base.submit(await res.text(), type)
                case 'json': return base.submit(await res.json(), type)
            }
        } catch (e: any) {
            error = e
            error_dialog.open()
        }
    }

    function UpdateInput(event: Event) {
        // Set the textbox value to the input filename.
        const input = base.get_input()
        textbox.value = input.value.slice(input.value.lastIndexOf('\\') + 1)

        // Grab the file.
        if (!event.target) return
        file = (<HTMLInputElement>event.target)?.files?.item(0) ?? ''
        if (file === '') return
        is_file = true

        // And disable editing the text box.
        textbox.disabled = true
    }
</script>

<ErrorDialog {error} bind:this={error_dialog} />

<FileDialogBase
    {title}
    {description}
    multiple={false}
    on_file_selected={UpdateInput}
    ok_callback={Accept}
    bind:this={base}
>   <input type="text" placeholder="Enter a URL or click 'Browse Files'" bind:this={textbox}>
</FileDialogBase>

<style lang="scss">
    input[type=text] {
        font-size: var(--text-size);
        width: 100%;
        padding: 0;
    }
</style>