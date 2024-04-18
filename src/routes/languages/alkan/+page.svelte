<script>
    import BasicLanguagePage from "$lib/components/BasicLanguagePage.svelte";
    import DocumentView from "$lib/components/DocumentView.svelte";
</script>

<BasicLanguagePage
    name="Aqkalle"
    stripe="A Sern-Cahilan conlang in the <em>Dog Days</em> Universe"
    video="https://www.youtube.com/embed/P45uZf4B-aw"
/>

<h2 class="stripe"><span>Resources</span></h2>
<section>
    <p>
        This Google Sheets document is where Alkan was created, and contains
        its dictionary, grammar specifics, romanization, and glosses of translated
        texts.
    </p>
    <DocumentView
        name="Documentation"
        src="https://docs.google.com/spreadsheets/d/e/2PACX-1vQdrDhiRIxJ4wTMG2H9rQuJT9Ku5motYXGubKvTCoVNPrRTBdZ2EWAxDJ2gml9T_PduhvCZkx-uVJwg/pubhtml?widget=true&amp;headers=false"
    />
</section>