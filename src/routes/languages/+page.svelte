<script>
    import Page from "$lib/components/Page.svelte";
    import Stripe from "$lib/components/Stripe.svelte";
</script>

<Page name="Languages" />

<Stripe>The Languages of Agma Schwa</Stripe>
<section>
    <h3 class="text-left">Conlangs from the world of Djogawa Djororx</h3>
    
    <p>These are the languages spoken by the dog people ("pups") in the canon of the <i>In Pursuit of Bez</i> universe, 
        including the ongoing comic <i><a href="/comic"><strong>Djogawa Djororx</strong></a></i>:
    </p>
    <ul>
        <li><a href="/languages/arodjun"><strong>Arodjun</strong></a>, the official language of the Fwonnel Peninsula by 2000AR</li>
        <li><a href="/languages/hvasvan"><strong>Hvasvan</strong></a>, the proto-language predecessor of the Sern-Cahilan language family, which includes Arodjun and Nashan</li>
        <li><a href="/languages/nashan"><strong>Nashan</strong></a>, the official language of the Nashan Empire by 2000AR</li>
        <li><a href="/languages/pthm"><strong>Pthm</strong></a>, the literary language of the Fifgath by 1600AR</li>
        <li><a href="/languages/alkan"><strong>Alkan</strong></a>, the language of Alka and Sardiki in the 2000's AR</li>
        <li><a href="/languages/permechikan"><strong>Permechikan</strong></a>, the language of the Permechikan Empire and its successor states, after 1800 AR</li>
        <li><a href="/languages/prins"><strong>Prins</strong></a>, the language of the Prins Empire, 2000AR</li>
        <li><a href="/languages/xomitec"><strong>Xomitec</strong></a>, the language of the Xomitec Empire in the 2000's AR</li>
    </ul>

    <h3 class="text-left">Cursed Conlangs, Jokelangs</h3>
    <p>These are the nightmarish abominations created by Nguh and Ætérnal over the years:

    </p>
    <ul>
        <li><a href="/languages/gumsmaq"><strong>Gumsmaq</strong></a>, the language of eating food</li>
        <li><a href="/languages/hyperpirate"><strong>HyperPirate</strong></a>, the language of pirates</li>
        <li><a href="/languages/rabbid"><strong>Rabbid (Lapin Cretin)</strong></a>, the language of the Rabbids from Ubisoft's Rayman Raving Rabbids series</li>
        <li><a href="/languages/santaa"><strong>Santaa</strong></a>, the language of Santa and Christmas</li>
        <li><a href="/languages/ultrafrench"><strong>ULTRAFRENCH</strong></a>, remember French, that old language from centuries ago? Well this is what came after.</li>
        <li><a href="/languages/hallowed-ween"><strong>The Hallowed Ween</strong></a>, the language of American Ghosts</li>
        <li><a href="/languages/hyperformal"><strong>HyperFormal</strong></a>, the language of the HyperFormal, natural enemies of the Hyperpirates</li>
        <li><a href="/languages/portugoose"><strong>Portugoose</strong></a>, the language of Portugeese</li>
        <li><a href="/languages/secret-handshake"><strong>Secret Handshake</strong></a>, a minilang for secret communication with one hand</li>
    </ul>

</section>
<Stripe>Sern-Cahilan Dictionaries</Stripe>
<section>
    <h3 class="text-left">Sern-Cahilan Unified Dictionary with PSC ID#s </h3>
    <p>The spreadsheet below contains the unified Sern-Cahilan Dictionary that shows how the root words of every applicable word inherited from Proto-Sern-Cahilan (Hvasvan).
        Every PSC Root has an ID number attached to it that can be used to create loan words with trackable etymologies. 
        Ignore most of the other sheets that currently exist in this document, as they're mostly vestiges of this gruelling process that I'm keeping in case of emergency.
    </p>
    <p>There may be a few lingering errors in ID matches.</p>
    <p>See the <a href="/languages/hvasvan"><strong>Hvasvan</strong></a> page for more information about Proto Sern-Cahilan.</p>

    <div class="tab-wrapper">
        <div class="tab">
            <button class="tab-button" id="button_scd_docs" onclick={() => OpenTab('scd_docs')}>
                Documentation
            </button>
        </div>
        <div class="tab-container">

            <div class="tab-content iframe-wrapper" id="scd_docs">
                <iframe jsname="L5Fo6c" jscontroller="usmiIb" jsaction="rcuQ6b:WYd;" class="embedded-doc"
                    id="arodjun_docs_content"
                    sandbox="allow-scripts allow-popups allow-forms allow-same-origin allow-popups-to-escape-sandbox allow-downloads"
                    aria-label="Spreadsheet, Sern-Cahilan Unified Dictionary" allowfullscreen=""
                    src="https://docs.google.com/spreadsheets/d/1bQSqiCr2tH3JRQh2L0_kaBWdsBGAeRXBXafQoFm7oOA/htmlembed"
                    frameborder="0">
                </iframe>
            </div>
        </div>
    </div>
</section>