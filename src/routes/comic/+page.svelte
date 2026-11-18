<script>
    import Page from "#lib/components/Page.svelte";
    import Stripe from "#lib/components/Stripe.svelte";
    import Backdrop from "#lib/components/Backdrop.svelte";
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
<img src="@lib/images/comic/image-cover.png" alt="Cover Page" class="-my-12">

<Stripe>About</Stripe>
<section>
    <p>
        Dog Days (Djogawa Djororx) is a webcomic written by Agma Schwa that takes place on Earth long after humans have
        disappeared and been replaced by anthropomorphic dogs. The story follows the adventures of a group of dogs who
        try to solve the mystery of the Ick while also dealing with the everyday struggles of life in the post-human world
        and with a broken family.
    </p>

    <div class="mb-4 flex justify-center gap-4 [&>img]:w-[calc((100%-2rem)/3)]!">
        <img src="@lib/images/comic/image-1.png" alt="">
        <img src="@lib/images/comic/image-2.png" alt="">
        <img src="@lib/images/comic/image-3.png" alt="">
    </div>

    <div class="mb-4 flex justify-center">
        <a class="link-button h-16! w-140! text-5xl leading-16! [@media(max-width:900px)]:w-full! [@media(max-width:900px)]:h-auto! [@media(max-width:900px)]:text-2xl! [@media(max-width:900px)]:leading-snug!" href="/comic/en/1/0">READ THE COMIC</a>
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

    <div class="flex justify-center gap-8 max-md:flex-col max-md:gap-3 [&>a]:w-60! [@media(max-width:900px)]:[&>a]:w-full!">
        <a href="/comic/explore-the-world" class="link-button">Explore the World</a>
        <a href="/languages/arodjun" class="link-button">Learn About Arodjun</a>
        <a href="/comic/characters" class="link-button">Meet the Characters</a>
    </div>
</section>
