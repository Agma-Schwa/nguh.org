<script lang="ts">
    import Dialog from "$lib/components/dialog/Dialog.svelte";
    import {HandledError, UserError} from "$lib/js/dialog";

    interface Props {
        title?: string
        include_stack_trace?: boolean
    }

    let { title = "Error", include_stack_trace = false}: Props = $props()
    let the_dialog: Dialog
    let error: string | Error = $state('')

    export function open(err: string | Error) {
        if (error instanceof HandledError) return;
        console.error(err)
        error = err
        the_dialog.open().ignore_cancellation()
    }
</script>

<!-- Dialog message. -->
{#snippet content()}
    {#if error !== ''}
        {#if
            typeof error === 'string' ||
            error instanceof UserError ||
            !include_stack_trace
        }
            {@const message = (
                typeof error === 'object' && 'message' in error
                ? error.message
                : error
            )}
            <p>
            {#each message.split('\n') as line}
                {line}<br>
            {/each}
            </p>
        {:else}
            <p>
            {#each (error.stack ?? error.message).split('\n') as line}
                {line}<br>
            {/each}
            </p>
        {/if}
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