<script lang="ts">
    import Stripe from "$lib/components/Stripe.svelte";
    import {
        Configuration,
        DownloadURL, type EventList,
        PronounSetting,
        type RequiredFatalities,
        type TributeCharacterSelectOptions
    } from '$lib/js/hgs.svelte';
    import SingleFileDialog from "$lib/components/dialog/SingleFileDialog.svelte";
    import ErrorDialog from "$lib/components/dialog/ErrorDialog.svelte";
    import MultiFileDialog from "$lib/components/dialog/MultiFileDialog.svelte";
    import Changelog from "$lib/components/hgs/Changelog.svelte";
    import SettingsDialog from '$lib/components/hgs/SettingsDialog.svelte';

    interface Props {
        tributes: TributeCharacterSelectOptions[]
        start_game: (fatalities: RequiredFatalities) => void
        event_list: EventList
    }

    let {tributes = $bindable(), event_list = $bindable(), start_game}: Props = $props();
    let get_image_dialog: SingleFileDialog
    let error_dialog: ErrorDialog
    let load_characters_dialog: SingleFileDialog
    let upload_images_dialog: MultiFileDialog
    let settings_dialog: SettingsDialog

    /** Prompt the user for an image src to use for an <img>. */
    function GetImage(tribute: TributeCharacterSelectOptions) {
        get_image_dialog.open().and(res => { tribute.image_url = res.url })
    }

    /** Load characters from JSON. */
    async function LoadCharacters() {
        load_characters_dialog.open().and(async res => {
            const chars = await Configuration.LoadCharacters(res.data as object);
            if (chars instanceof Error) return error_dialog.open(chars)
            tributes = chars
        })
    }

    /** Save characters to JSON. */
    async function SaveCharacters() {
        const chars = await Configuration.SaveCharacters(tributes);
        if (chars instanceof Error) return error_dialog.open(chars)
        DownloadURL('characters.json', URL.createObjectURL(new Blob([JSON.stringify(chars, null, 4)], {type: 'application/json'})))
    }

    /** Start the game. */
    function StartGame() {
        start_game(settings_dialog.deaths_per_round())
    }

    /** Load several images from disk. */
    async function UploadImages() {
        upload_images_dialog.open().and(res => {
            for (const f of res) {
                const file = f.data as File
                if (!file.type.startsWith('image')) continue
                tributes.push({
                    name: file.name.slice(0, file.name.lastIndexOf(".")),
                    image_url: URL.createObjectURL(file),
                    pronoun_option: PronounSetting.Common
                })
            }
        })
    }
</script>

<SingleFileDialog
    bind:this={get_image_dialog}
    title='Select an image'
    preserve_extern_urls={true}
    description={'You can input a local file or a public url.\nThe image can be in any format your browser supports.'}
    type='raw'
/>

<SingleFileDialog
    bind:this={load_characters_dialog}
    title='Load Game Setup'
    description={'Click below to upload a save.\nThis will override the current setup. Unsaved changes will be lost!'}
    type='json'
/>

<MultiFileDialog
    bind:this={upload_images_dialog}
    title='Upload Images'
    preserve_extern_urls={true}
    description='Click below to select multiple files to add them as tributes.'
    type='raw'
/>

<SettingsDialog bind:this={settings_dialog} bind:event_list={event_list} />
<ErrorDialog bind:this={error_dialog} />

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

    <Changelog />
</section>

<Stripe>Choose your characters</Stripe>
<section>
    <div class="mb-4"><p>Current Players: {tributes.length}</p></div>

    <button onclick={() => settings_dialog.open()}>Settings</button>
    <button onclick={SaveCharacters}>Save Characters</button>
    <button onclick={LoadCharacters}>Load Characters</button>
    <button onclick={UploadImages}>Upload Images</button>

    <div class="mt-8 flex flex-wrap justify-between gap-y-8">
        {#each tributes as tribute, i}
            <form class="game-character flex flex-row items-end m-0">
                <div class="flex flex-col gap-3">
                    <div class="flex-row">
                        <button
                            type="button"
                            class="ml-auto danger-button"
                            onclick={() => tributes.splice(i, 1)}
                        >Delete Character</button>
                    </div>

                    <div class="flex-row">
                        <button
                            class="ml-auto"
                            type="button"
                            onclick={() => tribute.image_url = undefined}
                        >Remove Image</button>
                    </div>

                    <div class="flex-row">
                        <label>Name:</label>
                        <input
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
                            name="gender_input"
                            placeholder="they/them/their/themself"
                            type="text"
                            bind:value={tribute.custom_pronouns}
                        >
                    </div>

                    <div class="flex-row"><label>Pronouns:</label>
                        <select
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

        <div class="relative w-96 h-40 mr-auto mt-auto mb-auto">
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
        <button onclick={StartGame}>Start Game</button>
    </div>
</section>

<style lang="scss">
    #add-character {
        position: absolute;
        inset: 2rem;

        border: none;
        padding: 0;
        width: 0;

        box-shadow: none;

        &:hover::before { color: white; }

        &::before {
            position: absolute;
            top: -4rem;
            left: 10rem;

            content: '+';

            font-size: 10rem;
            color: var(--accentlight);
            transition: color .5s;
        }
    }
    .game-character {
        input { padding-block: .225rem !important; }

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