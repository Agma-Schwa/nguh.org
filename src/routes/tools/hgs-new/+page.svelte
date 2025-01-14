<script lang="ts">
import '$lib/css/hunger_games_simulator.scss'
import Page from "$lib/components/Page.svelte";
import Stripe from "$lib/components/Stripe.svelte";
import Ribbon from "$lib/components/Ribbon.svelte";
import SingleFileDialog from "$lib/components/dialog/SingleFileDialog.svelte";

// ====================================================================== //
//  Tags                                                                  //
// ====================================================================== //
class Tag {
    static __next_id = 0

    /** All known tags. The id of a tag is an index into this array. */
    static registered_tags: Tag[] = []

    /** Index of the tag in the tag list. */
    readonly id: number

    /** The actual name of the tag. */
    __name: string
    get name(): string { return this.__name }
    set name(name: string) {
        for (const {__name} of Tag.registered_tags)
            if (name == __name)
                throw Error(`A tag with the name ${name} already exists`)
        this.__name = name
    }

    /** Creates a new tag. You probably want to use Tag.for() instead. */
    constructor(name: string) {
        this.id = Tag.__next_id++
        this.__name = name
        Tag.registered_tags.push(this)
    }

    /** Check if this tag is the same as another tag. */
    __equal(b: Tag) { return this.id == b.id }

    /**
     * When serialised, a tag be represented by its name only.
     * The tags themselves are stored separately.
     */
    toJSON() { return this.__name }

    /** Check if two tags are equal. */
    static equal(a: Tag | null | undefined, b: Tag | null | undefined) {
        if (!(a instanceof Tag) || !(b instanceof Tag)) return false
        if (!is(a, b.constructor)) return false
        return a.__equal(b)
    }

    /** Create a named tag for a given string. */
    static for(name: string): Tag { return Tag.registered_tags.find(t => t.name == name) ?? new Tag(name) }

    /** Dump all tags as JSON */
    static toJSON() { return this.registered_tags }
}

// ====================================================================== //
//  Tributes                                                              //
// ====================================================================== //
const enum PronounSetting {
    Masculine = "m",
    Feminine = "f",
    Common = "c",
    None = "n",
    Custom = "other",
}

/** Tribute data on the character select screen.. */
interface TributeCharacterSelectOptions {
    name: string
    custom_pronouns?: string
    pronoun_option: PronounSetting
    image_url?: string
}

/** The options passed to the `Tribute` constructor. */
interface TributeOptions {
    uses_pronouns: boolean
    pronouns: TributePronouns
    plural: boolean
    image: string
    tags?: Tag[]
}

/** The N/A/G/R pronouns used by a tribute. */
interface TributePronouns {
    nominative?: string
    accusative?: string
    genitive?: string
    reflexive?: string
}

/** A tribute in game or on the character selection screen. */
class Tribute {
    raw_name: string
    pronouns: TributePronouns
    uses_pronouns: boolean
    image_src: string
    plural: boolean
    kills: number
    died_in_round: number
    __tags: Tag[]

    constructor(name: string, options: TributeOptions) {
        this.raw_name = name
        this.pronouns = {}
        this.uses_pronouns = options.uses_pronouns ?? true
        if (this.uses_pronouns) this.pronouns = {...options.pronouns}
        this.image_src = options.image ?? ''
        this.plural = options.plural ?? false
        this.kills = 0
        this.died_in_round = 0
        this.__tags = []
        if (options.tags) this.__tags.push(...options.tags)
    }

    /** Check whether this tribute has a given tag. */
    has(t: Tag): boolean {
        for (const tag of this.__tags)
            if (Tag.equal(tag, t))
                return true
        return false
    }

    get name() { return `<span class="tribute-name">${this.raw_name}</span>` }
    get image() { return `<img class="tribute-image" alt="${this.raw_name}" src="${this.image_src}"></img>` }

    /** Add a tag to this tribute. */
    tag(t: Tag): void { if (!this.has(t)) this.__tags.push(t) }
}

// ====================================================================== //
//  Game                                                                  //
// ====================================================================== //
class Game {

}

/** Create a new game. */
function CreateGame() {
    game = new Game()
}

/** Prompt the user for an image src to use for an <img>. */
function GetImage(tribute: TributeCharacterSelectOptions) {
    get_image_dialog.open().then(res => { tribute.image_url = res.url })
}

// Dialogs.
let get_image_dialog: SingleFileDialog

// The current game state.
let game: Game | null = $state(null)

// Remaining state for an ongoing game; this is all grouped together
// to ensure that games don’t influence each other. The only reason the
// game state is separate is because there is also a ‘game state’ for
// rendering the character selection UI.

// Tributes that are currently in the character selector.
let tributes: TributeCharacterSelectOptions[] = $state([
    {
        name: "Player 1",
        pronoun_option: PronounSetting.Masculine,
    },
    {
        name: "Player 2",
        pronoun_option: PronounSetting.Feminine,
    },
    {
        name: "Player 3",
        pronoun_option: PronounSetting.Custom,
    },
]);
</script>

<Page name="Hunger Games Simulator" theme="dark" />
<Ribbon><em>Last Updated: 28 October 2024</em></Ribbon>

<svelte:head>
    <!-- FIXME: Extract metadata to separate component  -->
    <meta name="keywords" content="hunger games simulator hungergame hungergames hungergamessimulator humger-games simulator hunger-games-simulator">
</svelte:head>

<!-- Dialogs -->
<SingleFileDialog
    bind:this={get_image_dialog}
    title='Select an image'
    preserve_extern_urls={true}
    description={'You can input a local file or a public url.\nThe image can be in any format your browser supports.'}
    type='raw'
/>

<Stripe>Info</Stripe>
<section>
    <div class="flex-row gap-8">
        <article>
            <p>
                This Hunger Games Simulator exists because we were displeased with the
                other simulators out there; the one that we were using prior to the creation
                of this one (the one at brantsteele.net) made it very difficult to upload images
                and was utilising a needlessly convoluted server-driven system.
            </p>
            <p>
                This simulator was created to address both of those shortcomings. With it, you can easily upload
                whatever images you want. You can also just give it a URL that points to a publicly accessible image,
                and it will work just fine—so long as your browser supports it, that is.
            </p>
            <p>
                What's more, this simulator runs entirely in the browser, meaning that you could even download
                the page and use it offline if you so desired. This also means that it should be faster than
                the simulator we were using before, since it does not need to send data to a server and back
                every single time you press a button.
            </p>
        </article>
        <div class="center flex-column gap1">
            <img src="$lib/images/agma_logo_white.png" alt="Agma Schwa Logo" class="small-image">
            <a class="bright-link" href="https://www.youtube.com/@AgmaSchwa">Subscribe to Agma Schwa</a>
        </div>
    </div>
    <p class="mt-4">
        The events are mainly taken from the brantsteele.net simulator, though some members of our community
        have contributed to the event list as well. You can disable existing events or add custom events by
        clicking the ‘Settings’ button below and then ‘Edit Events’. You can also add new events, download
        all events, and upload your own.
    </p>
</section>

<Stripe>Source Code, Bug Reports, Contributing, etc.</Stripe>
<section>
    <p>
        If you'd like to report a bug or suggest a feature, you can do so on the
        <a href="https://discord.gg/zCA2Urv7Tc">Agma Schwa Discord Server</a>. Just ping Ætérnal
        in the #hunger-games-simulator channel.
    </p>
    <p>
        Alternatively, you can also file an issue <a href="https://github.com/Agma-Schwa/nguh.org/issues/new?assignees=Sirraide&labels=Hunger+Games+Simulator&projects=&template=hunger-games-simulator-bug.md&title=%5BHGS%5D+Insert+a+brief+description+of+your+problem+here">
        here</a>. This requires you to have a free GitHub account.
    </p>
    <p>
        The source code of nguh.org, including the Hunger Games Simulator, is hosted in
        <a href="https://github.com/Agma-Schwa/nguh.org">this GitHub repository</a>.
    </p>
    <p>
        Support the game developer, Ætérnal, on <a href="https://www.patreon.com/sirraide">Patreon</a>.
    </p>
    <p>
        Thanks also to GitHub user @spaulmark for implementing the bulk-upload feature.
    </p>
    <p>
        Last Update: 28 October 2024.
    </p>

    <button class="mt-4">Changelog</button>
</section>

{#if game === null}
<Stripe>Choose your characters</Stripe>
<section>
    <div class="mb-4"><p>Current Players: {tributes.length}</p></div>

    <button>Settings</button>
    <button>Save Characters</button>
    <button>Load Characters</button>
    <button>Upload Images</button>

    <div class="mt-8 flex flex-wrap gap-y-8" id="character-selects">
        {#each tributes as tribute, i}
        <form class="game-character">
            <div class="name-and-pronouns flex-column">
                <div class="flex-row">
                    <button
                        type="button"
                        class="character-delete danger-button"
                        onclick={() => tributes.splice(i, 1)}
                    >Delete Character</button>
                </div>

                <div class="flex-row">
                    <button
                        type="button"
                        class="image-remove"
                        onclick={() => tribute.image_url = undefined}
                    >Remove Image</button>
                </div>

                <div class="flex-row">
                    <label>Name:</label>
                    <input
                        class="character-name"
                        name="character"
                        type="text"
                        bind:value={tribute.name}
                    >
                </div>

                <div
                    class="flex-row custom-gender-input-wrapper"
                    style="display: {
                        tribute.pronoun_option === PronounSetting.Custom
                        ? 'inherit'
                        : 'none'
                    };"
                >   <label>Pronouns:</label>
                    <input
                        class="custom-gender-input"
                        name="gender_input"
                        placeholder="they/them/their/themself"
                        type="text"
                        bind:value={tribute.custom_pronouns}
                    >
                </div>

                <div class="flex-row"><label>Pronouns:</label>
                    <select
                        class="gender-select"
                        name="gender_select"
                        bind:value={tribute.pronoun_option}
                    >   <!--
                            The values used here are already in a lot of save files,
                            so do NOT change these lightly!
                        -->
                        <option value="m">he/him/his/himself</option>
                        <option value="f">she/her/her/herself</option>
                        <option value="c">they/them/their/themself</option>
                        <option value="n">No Pronouns</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>
            <div id="image-wrapper" class="image-wrapper">
                <img
                    alt="Click to add an image"
                    class="non-previewable-icon tribute-image"
                    src={tribute.image_url ?? ''}
                    onclick={() => GetImage(tribute)}
                >
            </div>
        </form>
        {/each}

        <div id="add-character-button-wrapper">
            <button
                id="add-character"
                type="button"
                onclick={() => tributes.push({
                    name: "Player " + (tributes.length + 1),
                    pronoun_option: PronounSetting.Common,
                })}
            ></button>
        </div>
    </div>
    <div class="flex justify-center mt-8">
        <button onclick={CreateGame}>Start Game</button>
    </div>
</section>
{/if}

<style lang="scss">
    .game-character {
        select, option, input {
            color: black;
            width: 15rem;
            border: none;
        }

        select, option, input, button {
            height: 2rem;
            width: 16.5rem;
        }

        label {
            margin-right: 1rem;
            width: 6rem;
        }
    }
</style>