<script lang="ts">
    import type {FormattedMessage} from "$lib/js/hgs";

    interface Props {
        parts: FormattedMessage
    }

    let {parts}: Props = $props();
</script>

<p class="mr-auto ml-auto max-w-3xl text-center">
    {#each parts as part}
        {#if typeof part === 'string'}
            {part}
        {:else}
            <span class="tribute-name">{part.value}</span>
        {/if}
    {/each}
</p>

<style lang="scss">
    p { max-width: 50rem }
    .tribute-name { color: var(--accentlight); }
</style>