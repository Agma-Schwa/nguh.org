<script lang="ts">
    import '#lib/css/speedrun.css'
    import Page from "#lib/components/Page.svelte";
    import Stripe from "#lib/components/Stripe.svelte";
    import YouTubeVideo from "#lib/components/YouTubeVideo.svelte";
    import Leaderboard from "#lib/components/speedrun/Leaderboard.svelte";
    import any_per_cent_image from '#lib/images/speedrun/any percent.png'
    import dice_per_cent_image from '#lib/images/speedrun/dice percent.png'
</script>

<Page name="Speedrun" />

<Stripe>Conlang Speedrunning</Stripe>
<section class="flex gap-8 *:min-w-0 *:basis-full max-[900px]:flex-col">
    <YouTubeVideo src="https://www.youtube.com/embed/M66m38w-s6c" />
    <article class="pars">
        <p>
            The Agma Schwa Conlang Speedrunning Method is described below,
            with the dice rolls being optional, either to randomize the
            challenge level or to avoid indecisiveness.
        </p>
        <p>
            If you make a speedrun and would like to submit your time for the leaderboard,
            record your attempt with the time visible, upload it somewhere where it’s publicly
            accessible (e.g. on YouTube), and submit it in the <strong>#speedrun</strong> channel
            on the <a href="https://discord.gg/zCA2Urv7Tc">Agma Schwa Discord Server</a>; include
            the time and the category you are submitting for in your submission.
        </p>

        <p><strong>Click <a href="#rules">here</a> for a step-by-step description of the rules.</strong></p>
        <p>NB: We do our best to update the documentation below as needed; however, should it differ from
            <a href="https://drive.google.com/open?id=14P1VrhrO3r8COqmOqvT82-DVKE8ykERjvHU059_Zf0A"><strong><em>the Official Google Doc</em></strong></a>,
            then the latter takes precedence.</p>
    </article>
</section>

<Stripe>Leaderboard</Stripe>
<section>
    <article class="pars">
        <p>
            The following lists, which are small but growing, are of proven conlang
            speedrun records according to this method.
        </p>
        <p>
            Dice % is defined as: A run where any variables that are presented with dice
            options are actually rolled, and the runner deals with the consequences
            of those rolls.
        </p>
        <p>
            Any % is defined as: A run where the dice are either not rolled or are rolled
            selectively in order to improve the speed.
        </p>

    </article>
    <article class="mt-8 flex justify-evenly [@media(max-width:900px)]:flex-col [@media(max-width:900px)]:items-center">
        <Leaderboard
            name="Original Dice %"
            image={dice_per_cent_image}
            scores={[
                ['Kate the Pan', '21:34'],
                ['Kate the Pan', '21:52'],
                ['Agma Schwa', '33:07'],
                ['GalacticSand', '33:28'],
                ['Kate the Pan', '37:36'],
                ['Mr Elephant', '47:44'],
                ['Stets Uninu', '48:37'],
                ['GalacticSand', '51:04'],
                ['benny6675', '1:02:19'],
                ['eqqemaś', '1:50:02']
            ]}
        />

        <Leaderboard
            name="Original Any %"
            image={any_per_cent_image}
            scores={[
                ['Kate the Pan', '21:55'],
                ['Agma Schwa', '31:39'],
                ['N3', '39:41'],
                ['N3', '1:25:12']
            ]}
        />
    </article>
</section>

<Stripe>Agma Schwa’s Conlang Speedrun (Any %) Requirements</Stripe>
<section class="[&_ol]:list-decimal [&_ul]:list-disc [&_:is(ol,ul)]:ps-8">
    <h3 class="text-left">Prerequisites</h3>
    <ul id="prerequisites">
        <li>Have a browser and either Excel or Sheets open.</li>
        <li><a target="_blank" rel="noopener noreferrer" href="https://en.wiktionary.org/wiki/Appendix:Swadesh_lists#Indo-European_languages(Proto-Indo-European)">Wiktionary Swadesh List Appendix</a>
        </li>
        <li><a target="_blank" rel="noopener noreferrer" href="http://akana.conlang.org/tools/awkwords/">Phonology and Word List</a></li>
        <li><a target="_blank" rel="noopener noreferrer" href="https://rolladie.net/">Dice Rolling</a></li>
        <li><a target="_blank" rel="noopener noreferrer" href="http://zompist.com/sca2.html">Sound Changes</a></li>
        <li><a target="_blank" rel="noopener noreferrer" href="https://www.online-stopwatch.com/">Time Yourself</a></li>
    </ul>

    <h3 id="rules" class="text-left">RULES</h3>
    <ol>
        <li>
            <p class="list-head">Choose phonology</p>
            <p>Your phonology must differ from the website’s default in at least six ways.</p>
        </li>
        <li>
            <p class="list-head">Word Pattern (Roll a d6)</p>
            <ol>
                <li>CV(CV)(N)</li>
                <li>CV(CV)</li>
                <li>(C)V(CV)</li>
                <li>CV(N)CV(N)</li>
                <li>(N)CV(N)(CV)</li>
                <li>CVN(CV)(N)</li>
            </ol>
        </li>
        <li>
            <p class="list-head">Generate Words</p>
            <p>
                Generate 5,000 words, remove duplicates, and put the results in Excel or Sheets with one word per line.
                This will probably leave around 1,000 words. If you get fewer than 1,000, add more variables to the phonology.
                10–13 additions seem to be enough, but the minimum for the game is six.
            </p>
        </li>
        <li>
            <p class="list-head">At least five phonological changes</p>
        </li>
        <li>
            <p class="list-head">Top 100/207 from one of Wiktionary’s Swadesh lists, put on Excel/Sheets</p>
        </li>
        <li>
            <p class="list-head">Mark categories for verbs, nouns, adjectives, and adverbs (roll a d6):</p>
            <ul>
                <li class="marker:content-['1,2._']">Prefixes</li>
                <li class="marker:content-['3,4._']">Suffixes</li>
                <li class="marker:content-['5._']">Infixes</li>
                <li class="marker:content-['6._']">Particles</li>
            </ul>
        </li>
        <li>
            <p class="list-head">Word Order</p>
            <ol>
                <li>SVO</li>
                <li>SOV</li>
                <li>VOS</li>
                <li>OSV</li>
                <li>OVS</li>
                <li>VSO</li>
            </ol>
        </li>
        <li>
            <p class="list-head">Morphosyntactic Alignment</p>
            <ul>
                <li class="marker:content-['1–4._']">Nominative/Accusative</li>
                <li class="marker:content-['5,6._']">Ergative/Absolutive</li>
            </ul>
        </li>
        <li>
            <p class="list-head">Morphology</p>
            <ol>
                <li>
                    <p class="mgb0">Synthetic</p>
                    <p class="no-mg-block-start mgt0">
                        Create <span class="[font-variant-caps:all-small-caps]">NOM/ERG, ACC/ABS, DAT, GEN</span> markers
                        according to the phonology.
                    </p>
                </li>
                <li>Analytic</li>
            </ol>
        </li>
        <li>
            <p class="list-head">Verb Conjugation</p>
            <ol>
                <li>None</li>
                <li class="marker:content-['2,3._']">Number+Tense</li>
                <li class="marker:content-['4._']">Number</li>
                <li class="marker:content-['5,6._']">Tense</li>
            </ol>
        </li>
        <li>
            <p class="list-head">If no tense conjugation, create tense auxiliaries as follows, otherwise skip this step</p>
            <ol>
                <li>None</li>
                <li class="marker:content-['2–5._']">Past+Present+Future</li>
                <li class="marker:content-['6._']">Past+Present</li>
            </ol>
        </li>
        <li>
            <p class="list-head">Grammatical Number</p>
            <ol>
                <li class="marker:content-['1,2._']">Singular/Plural</li>
                <li class="marker:content-['3,4._']">Singular/Dual/Plural</li>
                <li class="marker:content-['5._']">Singular/Paucal/Plural</li>
                <li class="marker:content-['6._']">Singular/Plural/Collective</li>
            </ol>
        </li>
        <li>
            <p class="list-head">Grammatical Number: Noun-Adjective Agreement</p>
            <ol>
                <li>Yes</li>
                <li>No</li>
            </ol>
        </li>
        <li>
            <p class="list-head">Grammatical Number: Subject/Agent-Verb Agreement</p>
            <ol>
                <li>Yes</li>
                <li>No</li>
            </ol>
        </li>
        <li>
            <p class="list-head">Articles</p>
            <ol>
                <li class="marker:content-['1,2._']">None</li>
                <li class="marker:content-['3._']">Definite</li>
                <li class="marker:content-['4._']">Definite/Indefinite</li>
                <li class="marker:content-['5,6._']">Definite/Indefinite/Demonstrative</li>
            </ol>
        </li>
        <li>
            <p class="list-head">Aspects</p>
            <p>First, roll a d4 to determine how many aspects to include.<br>
                Next, roll a d6 that many times to find out which forms must be marked (simple may be unmarked if it is not rolled).</p>
            <ol>
                <li class="marker:content-['1,2._']">Perfective</li>
                <li class="marker:content-['3._']">Imperfective</li>
                <li class="marker:content-['4._']">Progressive</li>
                <li class="marker:content-['5._']">Habitual</li>
                <li class="marker:content-['6._']">Simple</li>
            </ol>
        </li>
        <li>
            <p class="list-head">Moods</p>
            <p>First, roll a d4 to determine how many moods to include.<br>
                Next, roll a d6 that many times to find out which forms must be marked (indicative may be unmarked if it is not rolled).</p>
            <ol>
                <li>Conditional</li>
                <li class="marker:content-['2,3._']">Indicative</li>
                <li class="marker:content-['4._']">Imperative</li>
                <li class="marker:content-['5._']">Interrogative</li>
                <li class="marker:content-['6._']">Inferential</li>
            </ol>
        </li>
        <li>
            <p class="list-head">Name the Language</p>
            <p>Roll a d1000 and choose the corresponding word from the word list. If it already has a definition, too bad. Justify the weird name culturally.</p>
        </li>
        <li>
            <p class="list-head">Make an Acceptable Translation of</p>
            <p><em>All human beings are born free and equal in dignity and rights. They are endowed with reason and conscience and
                should act towards one another in a spirit of brotherhood.</em></p>
        </li>
    </ol>
</section>
