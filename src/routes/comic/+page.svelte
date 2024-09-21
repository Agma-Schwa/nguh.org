<script>
    import Page from "$lib/components/Page.svelte";
    import Stripe from "$lib/components/Stripe.svelte";
    import Backdrop from "$lib/components/Backdrop.svelte";
    import { style } from 'svelte-body';

    const first_page = '/static/comic/1/1-en.png'
</script>

<svelte:body use:style={'background-color: var(--body-background-colour);'} />
<svelte:head>
    <!-- Due to a bug in the import assets plugin, we have to make first_page a variable. -->
    <link rel="preload" as="image" href={first_page}>
</svelte:head>

<Page name="Dog Days" />
<Backdrop image="/static/comic/1/0-en.png" />

<Stripe>A Webcomic by Agma Schwa</Stripe>
<img src="$lib/images/comic/image-cover.png" alt="Cover Page" style="margin-block: -3rem">

<Stripe>About</Stripe>
<section>
    <p>
        Dog Days (Djogawa Djororx) is a webcomic written by Agma Schwa that takes place on Earth long after humans have
        disappeared and been replaced by anthropomorphic dogs. The story follows the adventures of a group of dogs who
        try to solve the mystery of the Ick while also dealing with the everyday struggles of life in the post-human world
        and with a broken family.
    </p>

    <div class="images">
        <img src="$lib/images/comic/image-1.png" alt="">
        <img src="$lib/images/comic/image-2.png" alt="">
        <img src="$lib/images/comic/image-3.png" alt="">
    </div>

    <div class="flex-row comic-button">
        <a class="link-button" href="/comic/en/1/0">READ THE COMIC</a>
    </div>

    <p>
        The comic is currently in its second chapter, which is being published online for free. Updates will hopefully
        occur more frequently now that the first chapter is complete.

        This comic is written in both English and Arodjun, a Sern-Cahilan language discussed in great
        detail in the book <a href="https://www.amazon.com/dp/1737701502/">A Grammar of the Arodjun Language</a>
        as well as in the YouTube shorts series <a href="https://www.youtube.com/watch?v=31Z2f3IGzpg&list=PLZI8zCShyGT9bYssTyfWYj23BoJxEe7_a">Arodjun 101</a>.
    </p>

    <p>
        On the comic pages, there is a button on the right side of the screen (or at the top if your screen is small or if you’re
        on mobile) that you can use to switch between the two at any time.
    </p>

    <div class="flex-row buttons2">
        <a href="/comic/explore-the-world" class="link-button">Explore the World</a>
        <a href="/languages/arodjun" class="link-button">Learn About Arodjun</a>
        <a href="/comic/characters" class="link-button">Meet the Characters</a>
    </div>
</section>


<style lang="scss">
    $image_gap: 1rem;

    .comic-button {
        justify-content: center;
        margin-bottom: 1rem;

        a {
            width: 35rem;
            font-size: 30pt;
            padding-block: 1rem;
        }
    }

    .buttons2 {
        justify-content: center;
        gap: 2rem;

        a { width: 15rem; }
    }

    .images {
        display: flex;
        flex-direction: row;
        justify-content: center;
        margin-bottom: 1rem;
        gap: $image_gap;

        img {
            width: calc((100% - #{$image_gap} * 2) / 3) !important;
        }
    }

    @media only screen and (max-width: 900px) {
        .comic-button, .buttons2 {
            a { width: 100%; }
        }
    }
</style>