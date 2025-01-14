<script lang="ts">
    import Dialog from "$lib/components/dialog/Dialog.svelte";

    interface Props {
        title?: string
        description: string
    }

    let {title = 'Warning', description}: Props = $props()
    let the_dialog: Dialog

    export function open(): Promise<void> {
        return the_dialog.open()
    }
</script>

{#snippet controls()}
    <button onclick={() => the_dialog.resolve(null)}>Yes</button>
    <button onclick={() => the_dialog.reject()}>Cancel</button>
{/snippet}

{#snippet content()}
    <p>{description}</p>
{/snippet}

<Dialog
    bind:this={the_dialog}
    {title}
    {controls}
    {content}
/>