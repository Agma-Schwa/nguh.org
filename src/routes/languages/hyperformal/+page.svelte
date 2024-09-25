<script>
    import BasicLanguagePage from "$lib/components/BasicLanguagePage.svelte";
    import DocumentView from "$lib/components/DocumentView.svelte";
    import Stripe from "$lib/components/Stripe.svelte";
</script>

<BasicLanguagePage
    name="HyperFormal"
    stripe="A cloŋ by Agma Schwa and Ætérnal"
    video="https://www.youtube.com/embed/HN4cZ5BYEZU"
/>

<Stripe>Resources</Stripe>
<section>
    <p>
        This Google Sheets document is where HyperFormal was created, and contains
        its dictionary, grammar specifics, romanization, and glosses of translated
        texts.
    </p>
    <DocumentView
        name="Documentation"
        src="https://docs.google.com/spreadsheets/d/e/2PACX-1vQxrwNIe6wDHsp4jKMKBZD16PYs--qWZkD8PnT0-2W54mTyA0xhN2LT72xouQQphHc3dQKWm43vEx5M/pubhtml?widget=true&amp;headers=false"
    />
</section>