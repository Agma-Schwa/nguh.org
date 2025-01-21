<script lang="ts">
    import DocumentView from "$lib/components/DocumentView.svelte";
    import Page from "$lib/components/Page.svelte";
    import Stripe from "$lib/components/Stripe.svelte";
    import YouTubeVideo from "$lib/components/YouTubeVideo.svelte";

    interface Props {
        name: string;
        stripe: string;
        video: string;
        docs: string | undefined;
        before_docs: string | undefined;
        children?: import('svelte').Snippet;
    }

    let {
        name,
        stripe,
        video,
        docs,
        before_docs,
        children
    }: Props = $props();
</script>

<Page {name} />

<Stripe>{@html stripe}</Stripe>
<section>
    {@render children?.()}
</section>

<section>
    <YouTubeVideo src={video} />
</section>

{#if docs}
    <section>
        {#if before_docs}
            <p>{before_docs}</p>
        {/if}
        <DocumentView
            name="Documentation"
            src={docs}
        />
    </section>
{/if}
