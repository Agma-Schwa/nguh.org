<script lang="ts">
    import Dialog from "$lib/components/dialog/Dialog.svelte";
    import {FormatError, HandledError, UserError} from "$lib/js/trace";

    interface Props {
        title?: string
        error: string | Error
        include_stack_trace?: boolean
    }

    let { title = "Error", error, include_stack_trace = false}: Props = $props()
    let the_dialog: Dialog
    if (error !== '') console.error(error)
    export function open() {
        if (error instanceof HandledError) return;
        the_dialog.open()
    }
</script>

<!-- Dialog message. -->
{#snippet content()}
    {#if
        typeof error === 'string' ||
        error instanceof UserError ||
        !include_stack_trace
    } <p>{
        typeof error === 'object' && 'message' in error
        ? error.message
        : error
    }</p>
    {:else}
        <!-- FIXME: Also convert FormatError() into a proper component. -->
        {@html FormatError(error)}
    {/if}
{/snippet}

<!-- Dialog buttons. -->
{#snippet controls()}
    <button onclick={() => the_dialog.resolve(null)}>OK</button>
{/snippet}

<Dialog
    bind:this={the_dialog}
    {title}
    {controls}
    {content}
    title_colours={{
    normal: 'var(--accentred)',
    hover: 'var(--accentred-dark)',
    text: 'white',
}} />

<style lang="scss">
    .error-dialog-content {
        max-width: 50ch;
    }
</style>