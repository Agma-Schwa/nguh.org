<script>
    import Page from "$lib/components/Page.svelte";
    import {page} from "$app/state";
</script>

<Page name={page.status} />

<section>
    {#if page.error}
        {#if page.error.message.includes('\n')}
            {@const first_newline = page.error.message.indexOf('\n')}
            <h2>{page.error.message.substring(0, first_newline)}</h2>
            {#each page.error.message.substring(first_newline).split('\n') as line}
                <p>{line}</p>
            {/each}
        {:else}
            <h2>{page.error.message}</h2>
        {/if}
    {:else}
        <h2>Unknown error</h2>
    {/if}
</section>

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

    p + p {
        margin-bottom: 2rem;
    }
</style>
