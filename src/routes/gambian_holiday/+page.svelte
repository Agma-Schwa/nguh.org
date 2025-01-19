<script>
    import Page from "$lib/components/Page.svelte";
    import Stripe from "$lib/components/Stripe.svelte";
</script>
<Page name="Gambian Holiday Wiki" />

<Stripe>A Wiki-formatted story</Stripe>
<h3 class='mb-8 -mt-3'>by Agma Schwa and Suzudo</h3>
<section class="flex gap-8 [&>*]:basis-full">
    <article class='w-1/2'>
        <img src="$lib/images/gambian_holiday/wiki.png" alt="Preview" class="object-cover">
    </article>
    <article>
        <p>
            The Gambian Holiday Wiki is a rabbithole wiki-formatted story by
            Agma Schwa (King Horror) and Suzudo. The project began in late 2018
            as a joke and had been on hiatus since March of 2020 in preparation
            for the moving of the site from its past location on Fandom to its
            current location as a subdomain of nguh.org.
        </p>
        <p>
            Some of the content ended up being revamped, and the original Fandom
            continuity had been somewhat invalidated by the time of its arrival
            here on nguh.org; the move was completed in June of 2024, with Ætérnal
            joining as an editor and new entries continuing to be added to the wiki
            ever since.
        </p>
        <a
            href="https://gambianholiday.nguh.org/w/index.php?title=Main_Page"
            class="link-button mt-8 block text-2xl !w-3/4 !h-10 !leading-10 mx-auto"
        >Enter the Gambian Holiday Wiki</a>
    </article>
</section>

