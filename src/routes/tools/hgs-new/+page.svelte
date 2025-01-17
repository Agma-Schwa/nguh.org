<script lang="ts">
    import '$lib/css/hunger_games_simulator.scss'
    import Page from "$lib/components/Page.svelte";
    import Stripe from "$lib/components/Stripe.svelte";
    import Ribbon from "$lib/components/Ribbon.svelte";
    import CharacterSelectScreen from "$lib/components/hgs/CharacterSelectScreen.svelte";
    import ErrorDialog from "$lib/components/dialog/ErrorDialog.svelte";
    import {
        Configuration,
        type EventList, type FormattedMessage,
        Game,
        type GameRenderState,
        PronounSetting,
        RenderState,
        type TributeCharacterSelectOptions
    } from "$lib/js/hgs";
    import Message from "$lib/components/hgs/Message.svelte";
    import ConfirmDialog from "$lib/components/dialog/ConfirmDialog.svelte";
    import TributeStats from "$lib/components/hgs/TributeStats.svelte";
    import {onMount} from "svelte";

    // TODO: Use web storage API to store uploaded files for tribute images.

    // Dialogs.
    let error_dialog: ErrorDialog
    let abort_confirm: ConfirmDialog

    // The current game state.
    let game: Game | null = $state(null)

    // Event list.
    let event_list: EventList = $state(Configuration.LoadDefaultConfig())

    // Render state for the current game. This is updated every game step
    // to trigger Svelte to update the UI.
    let render_state: GameRenderState | null = $state(null)

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
    function AbortGame() {
        abort_confirm.open().and(EndGame)
    }

    /** End the current game. */
    function EndGame() {
        game = null
        render_state = null
    }

    /** Format the message for the winners of the game. */
    function FormatWinners(): FormattedMessage {
        const msg: FormattedMessage = []
        const winners = render_state?.tributes_alive!!
        const n = winners.length
        if (n === 1) msg.push('The winner is ', winners[0].name, '!')
        else if (n === 2) msg.push('The winners are ', winners[0].name, ' and ', winners[1].name, '!')
        else {
            msg.push('The winners are ')
            let i = 0
            for (; i < n - 1; i++) msg.push(winners[i].name, ', ')
            msg.push('and ', winners[i].name, '!')
        }
        return msg
    }

    /** Advance the current game. */
    function Proceed() {
        StepGame()
    }

    /** Create a new game. */
    function StartGame() {
        const in_game_tributes = Game.CreateTributesFromCharacterSelectOptions(tributes)
        if (in_game_tributes instanceof Error) {
            error_dialog.open(in_game_tributes)
            return
        }

        game = new Game(in_game_tributes, event_list)
        StepGame()
    }

    /** Advance the game. */
    function StepGame() {
        if (game === null) {
            error_dialog.open(new Error("No game is currently running."))
            return
        }

        const state = game.AdvanceGame()
        if (state instanceof Error) {
            error_dialog.open(state)
            return
        }

        // If the game is over, end it now.
        if (state.state === RenderState.GAME_OVER) {
            EndGame()
            return
        }

        window.scrollTo(0, 0)
        render_state = state

        // FIXME: We probably want a custom <Image> component instead.
        // @ts-ignore
        window.SetOpenImagePreview()
    }

    // For testing.
    function SkipToEnd() {
        EndGame()
        StartGame()
        while (render_state?.state !== RenderState.STATS)
            StepGame()
    }
</script>

<Page name="Hunger Games Simulator" theme="dark" />
<Ribbon><em>Last Updated: 28 October 2024</em></Ribbon>

<svelte:head>
    <!-- FIXME: Extract metadata to separate component  -->
    <meta name="keywords" content="hunger games simulator hungergame hungergames hungergamessimulator humger-games simulator hunger-games-simulator">
</svelte:head>

<ErrorDialog bind:this={error_dialog} />
<ConfirmDialog
    bind:this={abort_confirm}
    description="Your progress will be lost. Are you sure you want to abort the game?"
/>

<button onclick={SkipToEnd}>Skip To End</button>
{#if game === null}
    <CharacterSelectScreen bind:tributes={tributes} start_game={StartGame} />
{:else if render_state}
    <Stripe>Hunger Games Simulator</Stripe>
    <h3 class="game-title">{render_state.game_title}</h3>
    <section class="mt-8">
        <!-- Some rounds require us to display an additional message. -->
        {#if render_state.is(RenderState.ROUND_DEATHS)}
            <p class="text-center mb-12">
                {#if render_state.has_deaths}
                    {render_state.deaths} cannon shot{render_state.deaths === 1 ? '' : 's'}
                    can be heard in the distance.
                {:else}
                    No cannon shots can be heard in the distance.
                {/if}
            </p>
        {/if}

        <!-- Main content in the centre of the page. -->
        <div id="game-content">
            {#if render_state.is(RenderState.ROUND_EVENTS)}
                {#each render_state.round.game_events as event}
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
            {:else if render_state.is(RenderState.ROUND_DEATHS)}
                {#each render_state.tributes_died as tribute}
                    <div class="death-message-wrapper flex-column flex-centre">
                        <div class="death-message-image grayscale image-wrapper">
                            <img alt="{tribute.raw_name}" src="{tribute.image_src}">
                        </div>
                        <Message parts={[tribute.name, ' has died this round']} message_class="death-message" />
                    </div>
                {/each}
            {:else if render_state.is(RenderState.WINNERS)}
                {#if render_state.has_alive}
                    <div class="event-message-wrapper flex flex-col justify-center">
                        <div class="event-message-images flex">
                            {#each render_state.tributes_alive as tribute}
                                <div class="image-wrapper">
                                    <img alt="{tribute.raw_name}" src="{tribute.image_src}">
                                </div>
                            {/each}
                        </div>
                        <Message parts={FormatWinners()} />
                    </div>
                {:else}
                    <div class="event-message-wrapper flex flex-col justify-center">
                        <Message parts={['There are no survivors.']} />
                    </div>
                {/if}
            {:else if render_state.is(RenderState.GAME_DEATHS)}
                {#each render_state.rounds as round, i}
                    <div class="round-fatalities-wrapper flex-column flex-centre">
                        <h6 class="round-title">
                            <strong>
                                Round {i + 1}: {round.stage.slice(0, 1).toUpperCase() + round.stage.slice(1)}
                            </strong>
                        </h6>
                        <article class="round-fatalities">
                            {#each round.game_events.filter(e => e.event.fatalities.length !== 0) as event}
                                <Message parts={event.message} />
                            {:else}
                                <Message parts={['No-one died.']} />
                            {/each}
                        </article>
                    </div>
                {/each}
            {:else if render_state.is(RenderState.STATS)}
                <div class="flex flex-wrap justify-center">
                    <div class="tribute-stats-wrapper">
                        {#if render_state.has_alive}
                            <div class="alive-stats-wrapper">
                                <div class="alive-stats">
                                    {#each render_state.tributes_alive as tribute}
                                        <TributeStats {tribute} />
                                    {/each}
                                </div>
                            </div>
                        {/if}
                        {#if render_state.has_deaths}
                            <div class="dead-stats-wrapper">
                                {#if render_state.has_alive}
                                    <h3 class="tribute-stats-header">The Rest</h3>
                                {/if}
                                <div class="dead-stats">
                                    {#each render_state.tributes_died.toReversed() as tribute}
                                        <TributeStats {tribute} />
                                    {/each}
                                </div>
                            </div>
                        {/if}
                    </div>
                </div>
            {:else}
                <p>Internal Error: Invalid render state</p>
            {/if}
        </div>

        <!-- Buttons. -->
        <div class="flex justify-end mt-8" id="buttons-wrapper">
            <button id="advance-game" class="right-1/2 translate-x-1/2 absolute" onclick={Proceed}>Proceed</button>
            <button id="abort-game" class="danger-button" onclick={AbortGame}>Abort Game</button>
        </div>
    </section>
{:else}
    <p>Something went horribly wrong. This is a bug. </p>
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
