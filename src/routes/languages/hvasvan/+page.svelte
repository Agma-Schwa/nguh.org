<script>
    import Page from "$lib/components/Page.svelte";
    import Stripe from "$lib/components/Stripe.svelte";
    import YouTubeVideo from "$lib/components/YouTubeVideo.svelte";
    import DocumentView from "$lib/components/DocumentView.svelte";
</script>

<Page name="Hvasvan"></Page>

<Stripe>The Progenitor of the Sern-Cahilan Conlangs</Stripe>
<section>
    <YouTubeVideo src="https://www.youtube.com/embed/_8M3oRj8xhM"/>
</section>

<Stripe>Introduction</Stripe>
<section>
    <article class="pars">
        <p>Hvasvan, also known as Proto-Sern-Cahilan, was the progenitor to all Sern-Cahilan languages, including Arodjun, Nashan,
            Permechikan, Prins, and many others. It was originally spoken in what we know as the Mississippi River valley before
            it eventually split into the Sern (eastern) and Cahilan (western) branches. Linguists within the world of <em>Dog
            Days</em> know little about this language and have not yet realised that it is, in fact, the ancestor of all of these
            highly-spoken languages in the modern era.
        </p>

        <p>
            ‘The ancestors of the people who would eventually speak Arodjun migrated west of the
            Proto-Sern-Cahilan (PSC) urheimat, located near what is today Arkansas and Mississippi,
            around the year 4500 <span class="small-caps">br</span> (Before the Remodernization/Rediscovery, called
            <em>qlo djavjejarkx</em> or <span class="small-caps">qd</span> in Arodjun) during a large
            diaspora caused by some kind of ecological disaster. The PSC culture was a generally
            sedentary, mound-building culture before its destruction, and this culture of building
            structures into and of the ground would carry on in many different forms across
            different cultures.’<br> — Excerpt from <em>A Grammar of the Arodjun Language</em> by Agma Schwa.
        </p>
    </article>
</section>

<section>
    <p>Below is the Google Sheets document for Hvasvan, which includes tables with pronouns, declensions, conjugations,
    and more. It will continue to be updated over time.
    </p>

    <DocumentView
        name="Documentation"
        src="https://docs.google.com/spreadsheets/d/e/2PACX-1vTo7o_t80pO8n5aE98YEIrwoBqzcSAfUMa33xRq8PNRmqzZAZ_nu5vdauhxwvYKIoXO_ZtllBcBvB1Q/pubhtml?widget=true&amp;headers=false"
    />
</section>
