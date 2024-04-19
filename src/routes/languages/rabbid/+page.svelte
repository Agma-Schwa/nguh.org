<script>
    import Page from "$lib/components/Page.svelte";
    import Stripe from "$lib/components/Stripe.svelte";
    import YouTubeVideo from "$lib/components/YouTubeVideo.svelte";
</script>

<Page name="Rabbid" />
<Stripe>Rabbid (Lapin Cretin)</Stripe>
<section>
    <article class="flex-row gap2 flex-same-size yt-two-videos-container">
        <YouTubeVideo src="https://www.youtube.com/embed/mQi5_IUDAzg" />
        <YouTubeVideo src="https://www.youtube.com/embed/iLKo5yb3goI" />
    </article>

    <article>
        <p>
            A language, created by Robbie Cole, meant to be spoken by the Rabbids of Ubisoft’s Rabbids franchise.
        </p>
    </article>
</section>