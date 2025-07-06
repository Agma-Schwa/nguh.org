<script lang='ts'>
    import type {Nation} from '$lib/js/ung_types';

    interface Props {
        nation: Nation;
        links?: boolean;
        starred?: boolean,
    }

    let { nation, links = false, starred = false }: Props = $props()
</script>

{#snippet card()}
<div class='flex gap-2'>
    <img src={nation.flag_url} class='h-10 non-previewable-icon select-none' alt={nation.name}>
    <span id='name' class='leading-10 text-2xl'>
        {nation.name}
        {#if starred} ⭐ {/if}
    </span>
</div>
{/snippet}

{#if links}
    <a href='/ung/nations/{nation.id}'>{@render card()}</a>
{:else}
    {@render card()}
{/if}

<style lang='scss'>
    #name {
        font-variant: small-caps;
        font-family: Lato, sans-serif;
        color: var(--accentmedium);
    }
</style>