<script>
    import BasicLanguagePage from "$lib/components/BasicLanguagePage.svelte";
    import DocumentView from "$lib/components/DocumentView.svelte";
    import Stripe from "$lib/components/Stripe.svelte";
</script>

<BasicLanguagePage
    name="四质说 (Elemental)"
    stripe="The Language Definitely Spoken in Avatar: The Last Airbender"
    video="https://www.youtube.com/embed/PIk5BPWHprs?si=fw_gwDPYCmiBUJJi"
/>

<Stripe>Resources</Stripe>
<section>
    <p>
        This Google Sheets document is where Elemental was created, and contains
        its dictionary, grammar specifics, romanization, and glosses of translated
        texts.
    </p>
    <DocumentView
        name="Documentation"
        src="https://docs.google.com/spreadsheets/d/e/2PACX-1vSR4T9erCxDuE_ACT6FPLWfJQEw3H6QpryAQui3q2ZfFCQCbVlkKCbA1McunWd6Qu6i9zWSFNlIGoZN/pubhtml?widget=true&amp;headers=false"
    />
</section>

