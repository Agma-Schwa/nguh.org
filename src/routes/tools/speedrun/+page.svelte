<script lang="ts">
    import '$lib/css/speedrun.scss'
    import Page from "$lib/components/Page.svelte";
    import Stripe from "$lib/components/Stripe.svelte";
    import YouTubeVideo from "$lib/components/YouTubeVideo.svelte";
    import Leaderboard from "$lib/components/speedrun/Leaderboard.svelte";
    import any_per_cent_image from '$lib/images/speedrun/any percent.png'
    import dice_per_cent_image from '$lib/images/speedrun/dice percent.png'
</script>

<Page name="Speedrun" />

<Stripe>Conlang Speedrunning</Stripe>
<section class="flex gap-8 [&>*]:basis-full">
    <YouTubeVideo src="https://www.youtube.com/embed/M66m38w-s6c" />
    <article class="pars">
        <p>
            The Agma Schwa Conlang Speedrunning Method is described below,
            with the dice rolls being optional, either to randomize the
            challenge level or to avoid indecisiveness.
        </p>
        <p>
            If you make a speedrun and would like to submit your time for the leaderboard,
            record your attempt with the time visible, upload it somewhere where it’s publically
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
            Dice% is defined as: A run where any variables that are presented with dice
            options are actually rolled, and the runner deals with the consequences
            of those rolls.
        </p>
        <p>
            Any% is defined as: A run where the dice are either not rolled or are rolled
            selectively in order to improve the speed.
        </p>

    </article>
    <article class="leaderboards">
        <Leaderboard
            name="Original Dice%"
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
            name="Original Any%"
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

<Stripe>Agma Schwa’s Conlang Speedrun (Any%) Requirements</Stripe>
<section>
    <h3 class="text-left">Prerequisites</h3>
    <ul id="prerequisites">
        <li>Have internet open; have Excel or Sheets open</li>
        <li><a target="_blank" rel="noopener noreferrer" href="https://en.wiktionary.org/wiki/Appendix:Swadesh_lists#Indo-European_languages(Proto-Indo-European)">Wiktionary Swadesh List Appendix</a>
        </li>
        <li><a target="_blank" rel="noopener noreferrer" href="http://akana.conlang.org/tools/awkwords/">Phonology and Word List</a></li>
        <li><a target="_blank" rel="noopener noreferrer" href="https://rolladie.net/">Dice Rolling</a></li>
        <li><a target="_blank" rel="noopener noreferrer" href="http://zompist.com/sca2.html">Sound Changes</a></li>
        <li><a target="_blank" rel="noopener noreferrer" href="https://www.online-stopwatch.com/">Time Yourself</a></li>
    </ul>

    <h3 class="text-left">RULES</h3>
    <ol>
        <li>
            <p class="list-head">Choose phonology</p>
            <p>Cannot be website default, must have at least six differences from default</p>
        </li>
        <li>
            <p class="list-head">Word Pattern (Roll d6)</p>
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
                Choose to generate 5000 words, filter duplicates, new line each (this will probably create around 1000 words),
                put on Excel/Sheets. If it cannot generate at least 1000 words, more variables need to be added to phonology.
                10-13 additions seems to always be sufficient, but six minimum for the game.
            </p>
        </li>
        <li>
            <p class="list-head">At least five phonological changes</p>
        </li>
        <li>
            <p class="list-head">Top 100/207 from one of Wiktionary’s Swadesh lists, put on Excel/Sheets</p>
        </li>
        <li>
            <p class="list-head">Categories for Verbs, Nouns, Adjectives, Adverbs are marked using (d6): </p>
            <ul>
                <li class="_12">Prefixes</li>
                <li class="_34">Suffixes</li>
                <li class="_5">Infixes</li>
                <li class="_6">Particles</li>
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
                <li class="_1234">Nominative/Accusative</li>
                <li class="_56">Ergative/Absolutive</li>
            </ul>
        </li>
        <li>
            <p class="list-head">Morphology</p>
            <ol>
                <li>
                    <p class="mgb0">Synthetic</p>
                    <p class="no-mg-block-start mgt0">Create NOM/ERG, ACC/ABS, DAT, GEN markers according to phonology</p>
                </li>
                <li>Analytic</li>
            </ol>
        </li>
        <li>
            <p class="list-head">Verb Conjugation</p>
            <ol>
                <li>None</li>
                <li class="_23">Number+Tense</li>
                <li class="_4">Number</li>
                <li class="_56">Tense</li>
            </ol>
        </li>
        <li>
            <p class="list-head">If no tense conjugation, create tense auxiliaries as follows, otherwise skip this step</p>
            <ol>
                <li>None</li>
                <li class="_2345">Past+Present+Future</li>
                <li class="_6">Past+Present</li>
            </ol>
        </li>
        <li>
            <p class="list-head">Grammatical Number</p>
            <ol>
                <li class="_12">Singular/Plural</li>
                <li class="_34">Singular/Dual/Plural</li>
                <li class="_5">Singular/Paucal/Plural</li>
                <li class="_6">Singular/Plural/Collective</li>
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
                <li class="_12">None</li>
                <li class="_3">Definite</li>
                <li class="_4">Definite/Indefinite</li>
                <li class="_56">Definite/Indefinite/Demonstrative</li>
            </ol>
        </li>
        <li>
            <p class="list-head">Aspects</p>
            <p>First, roll a d4 to determine how many aspects to include.<br>
                Next, roll a d6 that many times to find out which forms must be marked (Simple may be unmarked if it is not rolled)</p>
            <ol>
                <li class="_12">Perfective</li>
                <li class="_3">Imperfective</li>
                <li class="_4">Progressive</li>
                <li class="_5">Habitual</li>
                <li class="_6">Simple</li>
            </ol>
        </li>
        <li>
            <p class="list-head">Moods</p>
            <p>First, roll D4 to determine how many moods to include<br>
                Next, roll D6 that many times to find out which forms must be marked (Indicative may be unmarked if it is not rolled)</p>
            <ol>
                <li>Conditional</li>
                <li class="_23">Indicative</li>
                <li class="_4">Imperative</li>
                <li class="_5">Interrogative</li>
                <li class="_6">Inferential</li>
            </ol>
        </li>
        <li>
            <p class="list-head">Name the Language</p>
            <p>Roll d1000, choose from the word list. If it already has a definition, too bad, justify the weird name culturally</p>
        </li>
        <li>
            <p class="list-head">Make an Acceptable Translation of</p>
            <p><em>All human beings are born free and equal in dignity and rights. They are endowed with reason and conscience and
                should act towards one another in a spirit of brotherhood.</em></p>
        </li>
    </ol>
</section>
