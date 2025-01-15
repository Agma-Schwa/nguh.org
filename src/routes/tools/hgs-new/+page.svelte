<script lang="ts">
    import '$lib/css/hunger_games_simulator.scss'
    import Page from "$lib/components/Page.svelte";
    import Stripe from "$lib/components/Stripe.svelte";
    import Ribbon from "$lib/components/Ribbon.svelte";
    import SingleFileDialog from "$lib/components/dialog/SingleFileDialog.svelte";
    import CharacterSelectScreen from "$lib/components/hgs/CharacterSelectScreen.svelte";
    import ErrorDialog from "$lib/components/dialog/ErrorDialog.svelte";
    import {
        Configuration,
        type EventList,
        Game, GameState,
        PronounSetting,
        Tag,
        type TributeCharacterSelectOptions,
        type TributeOptions,
        type TributePronouns
    } from "$lib/js/hgs";
    import Message from "$lib/components/hgs/Message.svelte";

    // TODO: Use web storage API to store uploaded files for tribute images.

    // Dialogs.
    let error_dialog: ErrorDialog

    // The current game state.
    let game: Game | null = $state(null)

    // Event list.
    let event_list: EventList = $state(Configuration.LoadDefaultConfig())

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
            custom_pronouns: 'foo/bar/foobar/baz'
        },
    ]);

    /** Abort the current game. */
    function AbortGame() { game = null }

    /** Advance the current game. */
    function Proceed() {
        if (game === null) {
            error_dialog.open(new Error("No game is currently running."))
            return
        }

        game.AdvanceGame()
    }

    /** Create a new game. */
    function StartGame() {
        const in_game_tributes = Game.CreateTributesFromCharacterSelectOptions(tributes)
        if (in_game_tributes instanceof Error) {
            error_dialog.open(in_game_tributes)
            return
        }

        game = new Game(in_game_tributes, event_list)
        game.AdvanceGame()
    }

    // For testing.
    $effect(() => {
        StartGame()
    })
</script>

<Page name="Hunger Games Simulator" theme="dark" />
<Ribbon><em>Last Updated: 28 October 2024</em></Ribbon>

<svelte:head>
    <!-- FIXME: Extract metadata to separate component  -->
    <meta name="keywords" content="hunger games simulator hungergame hungergames hungergamessimulator humger-games simulator hunger-games-simulator">
</svelte:head>

<ErrorDialog bind:this={error_dialog} />

{#if game === null}
    <CharacterSelectScreen bind:tributes={tributes} start_game={StartGame} />
{:else}
    <Stripe>{game.game_title} (state: {game.state})</Stripe>
    <section class="mt-8">
        <!-- Some rounds require us to display an additional message. -->
        {#if game.state === GameState.ROUND_RESULTS}
            <p id="game-before-content">
                {game.tributes_died.length} cannon shot{game.tributes_died.length === 1 ? '' : 's'}
                can be heard in the distance.
            </p>
        {/if}

        <!-- Main content in the centre of the page. -->
        <div id="game-content">
            <!-- Display the events of the last round. -->
            {#if game.state === GameState.ROUND_PART_1 || GameState.ROUND_PART_2}
                {#each game.last_round.game_events as event}
                    <div class="event-message-wrapper flex flex-col justify-center">
                        <div class="event-message-images flex">
                            {#each event.players_involved as tribute}
                                <div class="image-wrapper">
                                    <img alt="{tribute.raw_name}" src="{tribute.image_src}">
                                </div>
                            {/each}
                        </div>
                        <Message parts={event.message} />
                    </div>
                {/each}
            {/if}
        </div>

        <!-- Buttons. -->
        <div class="flex justify-end mt-8" id="buttons-wrapper">
            <button id="advance-game" class="right-1/2 translate-x-1/2 absolute" onclick={Proceed}>Proceed</button>
            <button id="abort-game" class="danger-button" onclick={AbortGame}>Abort Game</button>
        </div>
    </section>
{/if}

<style lang="scss">
    #advance-game, #abort-game {
        display: block;
        margin: 0 auto;

        width: 10rem;
        height: 3rem;
        font-size: 1.5rem;
    }

    #abort-game {
        width: 12rem;
        margin: 0;
    }
</style>
