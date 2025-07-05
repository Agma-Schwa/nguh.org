<script lang="ts">
    import Dialog from "$lib/components/dialog/Dialog.svelte";
    import type {DialogPromise} from "$lib/js/dialog.svelte";

    interface Props {
        title: string
        children?: import('svelte').Snippet
    }

    let {title, children}: Props = $props()
    let the_dialog: Dialog
    export function open() { return the_dialog.open().ignore_cancellation() }
</script>

{#snippet controls()}
    <button onclick={() => the_dialog.resolve()}>OK</button>
{/snippet}

<Dialog
    bind:this={the_dialog}
    {title}
    {controls}
    content={children}
/>
