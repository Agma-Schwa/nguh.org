<script>
    import Page from "$lib/components/Page.svelte";
    import Stripe from "$lib/components/Stripe.svelte";
    import YouTubeVideo from "$lib/components/YouTubeVideo.svelte";

    import {OpenTab} from "$lib/js/menus";
</script>

<Page name="Arodjun" />

<Stripe>A Sern-Cahilan conlang in the <em>Dog Days</em> Universe</Stripe>
<section>
    <YouTubeVideo src="https://www.youtube.com/embed/OhEydnV7txA?si=ypVxo9rpnhTkTGyf" />
</section>

<Stripe>Introduction and Phonology</Stripe>

<section>
    <article class="pars">
        <p>Arodjun, or "Kat jArodjunx," is a Western Sern-Cahilan language spoken
            in the Fwonnel Peninsula on the west coast of what is today Mexico
            and some of the Pacific Ocean.</p>

        <p>In a more meta sense, Arodjun/Ar̃ojun is an a priori artistic naturalistic
            constructed language. It follows a VOS word order, is mostly analytical,
            and features subject pronoun-tense combination "prowords."</p>

        <p>Its phonology, shown in the tables below, shows a slightly asymmetrical
            set of consonants. Its biggest outliers are /dm/, /xw/, and /ql/.
            These have deep histories in the Sern-Cahilan language family.</p>
    </article>

    <div class="table-wrapper">
        <table id="consonant-chart">
            <colgroup>
                <col>
                <col class="lborder">
                <col>
                <col class="lborder">
                <col>
                <col class="lborder">
                <col>
                <col class="lborder">
                <col class="lborder">
                <col class="lborder">
            </colgroup>
            <thead>
                <tr>
                    <th></th>
                    <th colspan="2">Labial</th>
                    <th colspan="2">Dental/Alveolar
                    </th>
                    <th colspan="2">(Alveolo-)Palatal
                    </th>
                    <th>Velar</th>
                    <th>Uvular</th>
                    <th>Glottal</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Plosive/<br>Affricate</td>
                    <td><strong>p</strong> [p, pʰ, p̚]</td>
                    <td class="align-right"><strong>b</strong> [b, β]</td>
                    <td><strong>t</strong> [t, tʰ, t̚]</td>
                    <td class="align-right"><strong>d</strong> [ɖ, d, dʰ]</td>
                    <td><strong>t͡s</strong> ⟨c⟩</td>
                    <td class="align-right"><strong>d͡ʒ</strong> ⟨dj⟩</td>
                    <td><strong>k</strong> [k, kʰ, g]</td>
                    <td><strong>qχ</strong> [qχ, χ] ⟨kx⟩</td>
                    <td><strong>ʔ</strong> [ʔ,’] ⟨’⟩</td>
                </tr>
                <tr>
                    <td>Fricative</td>
                    <td><strong>f</strong></td>
                    <td class="align-right"><strong>v</strong></td>
                    <td><strong>s</strong></td>
                    <td class="align-right"><strong>z</strong></td>
                    <td></td>
                    <td class="align-right"><strong>ʒ</strong> ⟨g⟩</td>
                    <td><strong>x</strong></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td>Lateral</td>
                    <td></td>
                    <td></td>
                    <td><strong>ɬ</strong> ⟨sl⟩</td>
                    <td class="align-right"><strong>ɮ</strong> ⟨zl⟩</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td><strong>qʟ</strong> ⟨ql⟩</td>
                    <td></td>
                </tr>
                <tr>
                    <td>Nasal</td>
                    <td></td>
                    <td class="align-right"><strong>m</strong></td>
                    <td></td>
                    <td class="align-right"><strong>n</strong></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td>Other</td>
                    <td></td>
                    <td class="align-right"><strong>w</strong></td>
                    <td></td>
                    <td class="align-right"><strong>r</strong> [r, ɾ]</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
            </tbody>
        </table>
    </div>

    <label class="table-label">Common Clusters:</label>

    <div class="table-wrapper">
        <table class="single-row-table" id="common-clusters">
            <tbody>
                <tr>
                    <td><strong>mj</strong> [mʲ]</td>
                    <td><strong>nj</strong> [nʲ, ɲ]</td>
                    <td><strong>dm</strong> [ɾm]</td>
                    <td><strong>xw</strong> [xw, ʍ]</td>
                </tr>
            </tbody>
        </table>
    </div>


    <p>Its vowels – /a/, /e/, /i/, /o/, /u/ – very recently converted from a
        seven-vowel system including a phonemic /ɛ/ (which merged with /e/)
        and /ə/ (which merged with phonemic /a/):</p>

    <table id="vowels-table">
        <thead>
            <tr>
                <th></th>
                <th>Front</th>
                <th>Central</th>
                <th>Back</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>High</td>
                <td><strong>i</strong> [i, ɪ]</td>
                <td><strong>u</strong> [u, ʊ, ə]</td>
                <td></td>
            </tr>
            <tr>
                <td>Close-Mid</td>
                <td><strong>e</strong> [ɛ, ɜ]</td>
                <td><strong>r</strong> [ɚ]</td>
                <td><strong>o</strong> [o, ʌ]</td>
            </tr>
            <tr>
                <td>Low</td>
                <td colspan="2"><strong>a</strong> [a, ɐ, ə]</td>
                <td></td>
            </tr>
        </tbody>
    </table>
</section>

<Stripe>Morphosyntax and Morphology</Stripe>
<section>
    <h3>Case System</h3>

    <p>Past versions of Arodjun were fully synthetic, though as time went on word order stabilized and the case system
        began to fade away. However, a reduced form of the case system still exists. The Arodjun cases are Nominative,
        Accusative, Dative, Genitive, and Animate Genitive.
        As the subject proword usually suffices for a noun in the nominative case, when the proword cannot account for
        the identity of the subject, the nominative case will be present. As such, the Accusative case is typically only
        marked when a Nominative noun is also present in the sentence, mostly for clarification purposes.</p>

    <table>
        <thead>
            <tr>
                <th>Noun Cases</th>
                <th>Regular Forms</th>
                <th>Following Plosives</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>NOM</td>
                <td>-ka</td>
                <td>-a</td>
            </tr>
            <tr>
                <td>ACC</td>
                <td>-pe</td>
                <td>-e</td>
            </tr>
            <tr>
                <td>DAT</td>
                <td>-mo</td>
                <td>-mo</td>
            </tr>
            <tr>
                <td>GEN</td>
                <td>-bwa</td>
                <td>-vwa</td>
            </tr>
            <tr>
                <td>AGEN</td>
                <td>-r</td>
                <td>-r</td>
            </tr>
        </tbody>
    </table>


    <h3>Noun Classes</h3>

    <p>In Arodjun, nouns are either physical nouns or nonphysical nouns. Physical nouns are people, places, or things
        and are typically realized in the gender neutral form -au. There are masculine and feminine physical noun
        suffixes as well, though these do not qualify as “grammatical gender,” as they don’t alter verb conjugations or
        affect related adjectives, etc. Nonphysical nouns are not split into any subcategories. </p>

    <table>
        <thead>
            <tr>
                <th>Noun Classes</th>
                <th>Singular</th>
                <th>Plural</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Nonphysical</td>
                <td>-x, -∅</td>
                <td>-x, -∅</td>
            </tr>
            <tr>
                <td>Physical (Neutral/Neuter)</td>
                <td>-au</td>
                <td>-awa</td>
            </tr>
            <tr>
                <td>Physical (masculine)</td>
                <td>-aux</td>
                <td>-auxo</td>
            </tr>
            <tr>
                <td>Physical (feminine)</td>
                <td>-aix</td>
                <td>-aixe</td>
            </tr>
        </tbody>
    </table>

    <h3>Derivational Affixes</h3>

    <p>
        There are many prefixes and suffixes that can alter a noun or adjective to make it have various different
        meanings. Here are a few of them in their regular forms.
    </p>
    <div>
    <table>
        <thead>
            <tr>
                <th>Noun Endings</th>
                <th>Singular</th>
                <th>Plural</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Masuline</td>
                <td>-aux</td>
                <td>-auxo</td>
            </tr>
            <tr>
                <td>Feminine</td>
                <td>-aix</td>
                <td>-aixe</td>
            </tr>
            <tr>
                <td>Neuter/Physical</td>
                <td>-au</td>
                <td>-awa</td>
            </tr>
            <tr>
                <td>Nonphysical</td>
                <td colspan="2">-x</td>
            </tr>
            <tr>
                <td>Professional</td>
                <td>-in</td>
                <td>-ino</td>
            </tr>
            <tr>
                <td>Instrumental</td>
                <td>-it</td>
                <td>-ito</td>
            </tr>
            <tr>
                <td>Regnant</td>
                <td>-uv</td>
                <td>-ubuv</td>
            </tr>
            <tr>
                <td>Commander/Honorific</td>
                <td>-ib</td>
                <td>-ivo</td>
            </tr>
            <tr>
                <td>Nationality</td>
                <td>-unk</td>
                <td>-uno</td>
            </tr>
            <tr>
                <td>City</td>
                <td colspan="2">-un/-n</td>
            </tr>
            <tr>
                <td>Town</td>
                <td colspan="2">-ic</td>
            </tr>
            <tr>
                <td>Area/Land</td>
                <td colspan="2">-sja</td>
            </tr>
            <tr>
                <td>Ridge</td>
                <td colspan="2">-kojo</td>
            </tr>
            <tr>
                <td>Lake</td>
                <td colspan="2">-dmair</td>
            </tr>
            <tr>
                <td>strait/river</td>
                <td colspan="2">-wif</td>
            </tr>
            <tr>
                <td>Hill</td>
                <td colspan="2">-anuin</td>
            </tr>
            <tr>
                <td>Pass</td>
                <td colspan="2">-ijet</td>
            </tr>
            <tr>
                <td>Canyon</td>
                <td colspan="2">-cijot</td>
            </tr>
        </tbody>
    </table>

    <table>
        <thead>
            <tr>
                <th colspan="2">Noun Quantifiers</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Neutral</td>
                <td>Ø</td>
            </tr>
            <tr>
                <td>Extra-Positive of</td>
                <td>xw-</td>
            </tr>
            <tr>
                <td>Opposite of</td>
                <td>k'-</td>
            </tr>
            <tr>
                <td>Lack of</td>
                <td>t'-</td>
            </tr>
            <tr>
                <td>Big/Many/Very</td>
                <td>xu-/x-</td>
            </tr>
            <tr>
                <td>Biggest/Collective</td>
                <td>xju-/xj-</td>
            </tr>
            <tr>
                <td>Small/Few</td>
                <td>pe-/p-</td>
            </tr>
            <tr>
                <td>Smallest/Piece of</td>
                <td>p'sju-/p'sj-</td>
            </tr>
            <tr>
                <td>Increment</td>
                <td>dja-/dj-</td>
            </tr>
            <tr>
                <td>Decrement</td>
                <td>vja-/vj-</td>
            </tr>
            <tr>
                <td>before/under</td>
                <td>qlo-/qlow-</td>
            </tr>
            <tr>
                <td>after/above</td>
                <td>bo-/bow-</td>
            </tr>
        </tbody>
    </table>

    <table>
        <thead>
            <tr>
                <th>Articles</th>
                <th>Suffix</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>This/These</td>
                <td>-k</td>
            </tr>
            <tr>
                <td>That/Those</td>
                <td>-c</td>
            </tr>
            <tr>
                <td>The Only</td>
                <td>-m</td>
            </tr>
            <tr>
                <td>The(Any)</td>
                <td>Ø</td>
            </tr>
            <tr>
                <td>A/Some</td>
                <td>-g</td>
            </tr>
            <tr>
                <td>None</td>
                <td>-xi</td>
            </tr>
        </tbody>
    </table>
    </div>
</section>

<Stripe>Grammar</Stripe>
<section>
    <p>The grammar of Arodjun follows its VOS structure strictly,
        with several conjunctions and other features which allow
        for large varieties of sentence structures.</p>

    <p>In general (though with several exceptions clarifies in the
        document and the book):</p>

    <ul>
        <li>The classic sentence order is as follows: Verb, Object, Subject,
            Subject Proword
        </li>
        <li>Adverbs and adverbial phrases that apply to verbs occur before the
            verb
        </li>
        <li>Adjectives follow nouns</li>
        <li>Adverbs that affect adjectives follow the adjective</li>
        <li>The subject proword must be present in every independent
            clause
        </li>
        <li>Indirect objects (Dative nouns) can be placed directly before or
            directly after the direct object (Accusative noun)
        </li>
        <li>Genitive nouns are placed after the noun with which it is associated,
            acts as an adjective
        </li>
    </ul>
</section>

<Stripe>Resources</Stripe>
<section>
    <p>The spreadsheet below shows the most recent publicly-available version of the Arodjun language, including its
        dictionary, calendar, naming conventions, and grammar tables. For a better-looking, well-arranged grammar, check
        out the full book A Grammar of the Arodjun Language!</p>

    <div class="tab-wrapper">
        <div class="tab">
            <button class="tab-button" id="button_arodjun_docs" onclick={() => OpenTab('arodjun_docs')}>
                Documentation
            </button>
        </div>
        <div class="tab-container">

            <div class="tab-content iframe-wrapper" id="arodjun_docs">
                <iframe jsname="L5Fo6c" jscontroller="usmiIb" jsaction="rcuQ6b:WYd;" class="embedded-doc"
                    id="arodjun_docs_content"
                    sandbox="allow-scripts allow-popups allow-forms allow-same-origin allow-popups-to-escape-sandbox allow-downloads"
                    aria-label="Spreadsheet, Arodjun, Katauu 9.0.4" allowfullscreen=""
                    src="https://docs.google.com/spreadsheets/d/1bVD4K2BA1b45YmQqa8I2wWBZ_ztr0Cr9Len-g6mBb7k/htmlembed"
                    frameborder="0">
                </iframe>
            </div>
        </div>
    </div>
</section>

<style lang="scss">
    @use '$lib/css/_vars.scss' as *;

    #consonant-chart {
        margin-top: 1rem;
        td:not(:first-child) { font-family: $ipafont; }
    }

    #common-clusters {
        border: none;
        font-family: $ipafont;
        td { width: 25%; }
    }

    #vowels-table {
        th, td { border: 1px solid $accentcolour; }
        td:not(:first-child) {
            text-align: center;
            font-family: $ipafont;
        }
    }
</style>