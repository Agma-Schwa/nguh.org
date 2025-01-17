<script lang="ts">
    import type {FormattedMessage} from "$lib/js/hgs";

    interface Props {
        parts: FormattedMessage
        message_class?: string
    }

    let {parts, message_class = "event-message"}: Props = $props();
</script>

<p class="{message_class}">
    {#each parts as part}
        {#if typeof part === 'string'}
            {part}
        {:else}
            <span class="tribute-name">{part.value}</span>
        {/if}
    {/each}
</p>

<style lang="scss">
    .tribute-name { color: var(--accentlight); }
</style>