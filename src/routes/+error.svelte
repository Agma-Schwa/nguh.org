<script>
    import Page from "#lib/components/Page.svelte";
    import {page} from "$app/state";
</script>

<Page name={page.status} />

<section class="[&_h2]:col-[1/span_3] [&_h2]:mt-12 [&_h2]:text-center [&_h2]:text-[4rem]! [&_h2]:uppercase [&_p]:mt-8 [&_p]:text-center [&_p]:text-[2rem] [&_p]:text-(--accentdarker) [&_p+p]:mb-8">
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
