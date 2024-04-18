<script lang="ts">
    import type {ActionData} from "../../../../.svelte-kit/types/src/routes/tools/speedrun/$types";

    import {page} from "$app/stores";

    import '$lib/css/speedrun.scss'
    import Page from "$lib/components/Page.svelte";
    import Stripe from "$lib/components/Stripe.svelte";
    import YouTubeVideo from "$lib/components/YouTubeVideo.svelte";
    import Leaderboard from "$lib/components/speedrun/Leaderboard.svelte";

    import any_per_cent_image from '$lib/images/speedrun/original-any-percent.png'
    import any_per_cent_mod_image from '$lib/images/speedrun/infl1.png'
    import dice_per_cent_image from '$lib/images/speedrun/dice percent.png'
    import dice_per_cent_mod_image from '$lib/images/speedrun/dice percent mod.png'
    import {browser} from "$app/environment";
    import {afterNavigate} from "$app/navigation";

    export let form: ActionData

    afterNavigate(async () => {
        if (document.readyState !== 'loading')
            await DisplayResultDialog()
        else {
            window.addEventListener('DOMContentLoaded', DisplayResultDialog)
        }
    })

    async function DisplayResultDialog() {
        const Dialog = (await import("$lib/js/dialog")).Dialog
        if (form?.success) {
            Dialog.make('Success', '<p>Your run has been submitted successfully.</p>', ['OK'], 'success-dialog').open().and()
        } else if ($page.status === 429) {
            Dialog.error(
                '<p>You have submitted too many runs in a short period of time. Please wait a while before submitting another run.</p>' +
                '<p>Additional submissions within that time period will be ignored and will add to the time you will have to wait.</p>'
            )
        } else if ($page.status >= 400 && $page.status < 500) {
            Dialog.error(
                '<p>It seems that you have submitted an invalid run. Please check that you have filled in all the fields correctly and try again.</p>'
            )
        } else if ($page.status >= 500) {
            Dialog.error(
                '<p>An error occurred while submitting your run. Please try again later. If the problem persists, please contact the ' +
                'mods on the Agma Schwa Discord server.</p>'
            )
        }
    }
</script>

<Page name="Speedrun" />

<Stripe>Conlang speedrunning</Stripe>
<section class="flex-row gap2 flex-same-size">
	<YouTubeVideo src="https://www.youtube.com/embed/M66m38w-s6c" />
	<article class="pars">
		<p>The Agma Schwa Conlang Speedrunning Method is described below,
			with the dice rolls being optional, either to randomize the
			challenge level or to avoid indecisiveness. </p>
		<p>If you make a speedrun and would like to submit your time for the leaderboard,
			record your attempt with the time visible and submit it to the
			<a href="https://discord.gg/zCA2Urv7Tc"> Agma Schwa Discord server</a>
			or to <a href="mailto:nguhmail@gmail.com">nguhmail@gmail.com</a>.</p>

		<p><strong>Click <a href="#rules">here</a> for a step-by-step description of the rules.</strong></p>

		<p><strong>Click <a href="#submit-h2">here</a> to submit a run.</strong></p>

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
			speedrun records according to this method. To submit a time, please see
			the <a href="#submit-h2">submitting a run</a> section below.
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
	<article class="flex-row gap2">
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

<Stripe>Submitting a Run</Stripe>
<section>
	<p>In order to submit a run, please fill in the form below. To submit a run, you must be a member of the
		Agma Schwa <a href="https://discord.gg/zCA2Urv7Tc">Discord Server</a>, and include your
        Discord <abbr title="If your username still includes a discriminator (e.g. #1234), please include that too.">
        <em>username</em></abbr> in the form below. Your submission will then appear in the
		<strong>#speedrun</strong> channel on the Discord and subsequently be posted to this page if found valid.</p>

	<p>You also need to put your Discord ID in the corresponding field below. If you don’t know how to make IDs visible,
		you can use the <code>/id</code> command in any channel on the Agma Schwa Discord server, and the bot will tell
		you what it is.</p>

	<p>Upload a recording of the run somewhere where it’s publicly accessible (YouTube, for instance,
		as a public or unlisted video), and put its URL in the <code>URL</code> field below.</p>
	<div class="flex-row form-wrapper">
		<form id="submit-run-form" name="submit_run" method="post" action="/speedrun?/submit">
			<label for="username" id="tag_label">Discord Username</label>
			<div class="row">
				<input value="1234" type="text" id="username" name="username" required min="1" max="255" maxlength="255">
			</div>

			<label for="username" id="tag_id">Discord ID</label>
			<div class="row">
				<input value="1234" type="text" id="id" name="id" required min="1" max="255" maxlength="255">
			</div>

			<label for="hh"><abbr title="Your time (hh:mm:ss)">Time</abbr></label>
			<div class="row">
				<input type="number" class="time" id="hh" name="hh" value="00" required min="0" maxlength="2">
				<span>:</span>
				<input type="number" class="time" name="mm" value="00" required max="60" min="0" maxlength="2">
				<span>:</span>
				<input type="number" class="time" name="ss" value="00" required max="60" min="0" maxlength="2">
			</div>

			<label for="category"><abbr title="See above">Category</abbr></label>
			<div class="row">
				<select name="category" id="category" required>
					<option value="Original+Dice%">Original Dice%</option>
					<option value="Original+Any%">Original Any%</option>
				</select>
			</div>

			<label for="url">URL</label>
			<div class="row"><input value="http://localhost:5173/speedrun#submit-h2" type="url" id="url" name="url" required maxlength="1024"></div>

			<div class="submit-wrapper"><input type="submit" value="Submit"></div>
		</form>
	</div>
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