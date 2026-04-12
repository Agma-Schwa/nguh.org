<script>
    import BasicLanguagePage from "$lib/components/BasicLanguagePage.svelte";
    import DocumentView from "$lib/components/DocumentView.svelte";
    import Stripe from "$lib/components/Stripe.svelte";
</script>

<BasicLanguagePage
    name="Late Fwonnel"
    stripe="An extinct Sern-Cahilan conlang in the <em>Dog Days</em> Universe"
    video="https://www.youtube.com/embed/1vXhFv9JpwI?si=rbXSNA9nnC5kH3HM"
/>

<Stripe>Resources</Stripe>
<section>
    <p>
        This Google Sheets document is where Fwonnel was created, and contains
        its dictionary, grammar specifics, romanization, and glosses of translated
        texts.
    </p>
    <DocumentView
        name="Documentation"
        src="https://docs.google.com/spreadsheets/d/e/2PACX-1vTfeqlV57R38-dMN4vY67a76eo9BH_bMPl1W7G3k2KoAy_oLJvkeCFvcFHlFY_zbmsvRR8TsqLg5Nph/pubhtml?widget=true&amp;headers=false"
    />
</section>

