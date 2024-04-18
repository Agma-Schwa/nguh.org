<script>
    import BasicLanguagePage from "$lib/components/BasicLanguagePage.svelte";
    import DocumentView from "$lib/components/DocumentView.svelte";
</script>

<BasicLanguagePage
    name="HyperPirate"
    stripe="A cloŋ by Agma Schwa and Ætérnal"
    video="https://www.youtube-nocookie.com/embed/i1uW1JRevxk"
/>

<h2 class="stripe"><span>Resources</span></h2>
<section>
    <p>
        This Google Sheets document is where HyperPirate was created, and contains
        its dictionary, grammar specifics, romanization, and glosses of translated
        texts.
    </p>
    <DocumentView
        name="Documentation"
        src="https://docs.google.com/spreadsheets/d/1-RaRlZQsi_TY0KSfsayRX2yFNe6932ylXkEqSi6Ghf0/htmlembed"
    />
</section>