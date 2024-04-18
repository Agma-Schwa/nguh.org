<script lang="ts">
    import DocumentView from "$lib/components/DocumentView.svelte";
    import Page from "$lib/components/Page.svelte";
    import Stripe from "$lib/components/Stripe.svelte";
    import YouTubeVideo from "$lib/components/YouTubeVideo.svelte";

    export let name: string
    export let stripe: string
    export let video: string
    export let docs: string
    export let before_docs: string | undefined
</script>

<Page name="{name}" />

<Stripe>{@html stripe}</Stripe>
<section>
    <slot />
</section>

<section>
    <YouTubeVideo src="{video}" />
</section>

{#if docs}
    <section>
        {#if before_docs}
            <p>{before_docs}</p>
        {/if}
        <DocumentView
            name="Documentation"
            src="{docs}"
        />
    </section>
{/if}
