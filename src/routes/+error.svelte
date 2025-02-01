<script>
    import Page from "$lib/components/Page.svelte";
    import {page} from "$app/stores";
</script>

<Page name={$page.status} />

{#if $page.error.message.includes('\n')}
    {@const first_newline = $page.error.message.indexOf('\n')}
    <h2>{$page.error.message.substring(0, first_newline)}</h2>
    <p>{$page.error.message.substring(first_newline)}</p>
{:else}
    <h2>{$page.error.message}</h2>
{/if}

<style>
    h2 {
        font-size: 4rem;
        text-align: center;
        grid-column: 1 / span 3;
        margin-top: 3rem;
        text-transform: uppercase;
    }

    p {
        color: var(--accentdarker);
        margin-top: 2rem;
        font-size: 2rem;
        text-align: center;
    }
</style>
