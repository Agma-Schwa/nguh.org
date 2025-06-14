<script lang="ts">
    import '$lib/css/hunger_games_simulator.scss'
    import Page from '$lib/components/Page.svelte';
    import Stripe from '$lib/components/Stripe.svelte';
    import Ribbon from '$lib/components/Ribbon.svelte';
    import CharacterSelectScreen from '$lib/components/hgs/CharacterSelectScreen.svelte';
    import ErrorDialog from '$lib/components/dialog/ErrorDialog.svelte';
    import {
        Configuration,
        type EventList,
        type FormattedMessage,
        Game,
        type GameRenderState, GameSettings,
        PronounSetting,
        RenderState,
        RequiredFatalitiesMode,
        TitleCase,
        type TributeCharacterSelectOptions
    } from '$lib/js/hgs.svelte';
    import Message from '$lib/components/hgs/Message.svelte';
    import ConfirmDialog from '$lib/components/dialog/ConfirmDialog.svelte';
    import Card from '$lib/components/hgs/Card.svelte';
    import TributeStatList from '$lib/components/hgs/TributeStatList.svelte';
    import {db} from './db';
    import {browser} from '$app/environment';
    import {page} from '$app/state';

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
    let tributes: TributeCharacterSelectOptions[] = $state([])

    // This cursed nonsense has the effect of both loading the state
    // from the DB on first load and saving it back to the DB every time
    // we modify it after that.
    let __initialised = $state(false)
    $effect(() => void LoadStateFromDB())
    $effect(() => { if (__initialised) SyncTributesToDB(tributes) })

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

    /** Load tributes from local DB. */
    async function LoadStateFromDB() {
        try {
            // Tributes.
            const data = await db.tributes.toArray()
            const chars = await Configuration.LoadCharacters({version: Configuration.current_config_version, characters: data})

            // Set this first so we save the example setup on write below.
            __initialised = true

            // If we have characters stored, use them.
            if (chars.length !== 0) tributes = chars

            // Otherwise, use a basic example setup.
            else tributes = [
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
            ]
        } catch (e: any) {
            error_dialog.open(e)
        }
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

    /** Save the tributes back to the database. */
    async function SyncTributesToDB(tribs: TributeCharacterSelectOptions[]) {
        try {
            const characters = await Configuration.SerialiseCharacters(tribs)
            await db.tributes.clear()
            await db.tributes.bulkAdd(characters)
        } catch (e: any) {
            error_dialog.open(e)
        }
    }

/*    async function Add() {
        try {
            await db.tributes.add({
                name: 'Player 1',
                gender_select: 'm',
                pronoun_str: '',
                tags: [],
            })
            tributes = tributes
        } catch (e: any) {
            error_dialog.open(e)
        }
    }*/
</script>

<Page name="Hunger Games Simulator" theme="dark" />
{#if !page.data.user}
    <Ribbon><em>Last Updated: 24 January 2025</em></Ribbon>
{/if}

<svelte:head>
    <!-- FIXME: Extract metadata to separate component  -->
    <meta name="keywords" content="hunger games simulator hungergame hungergames hungergamessimulator humger-games simulator hunger-games-simulator">
</svelte:head>

<ErrorDialog bind:this={error_dialog} />
<ConfirmDialog
    bind:this={abort_confirm}
    description="Your progress will be lost. Are you sure you want to abort the game?"
/>

{#if game === null}
    <CharacterSelectScreen
        bind:tributes
        bind:event_list
        start_game={StartGame}
    />
{:else if render_state}
    <Stripe>Hunger Games Simulator</Stripe>
    <h3>{render_state.game_title}</h3>
    <section class="mt-8">
        <div>
            {#if render_state.is(RenderState.ROUND_EVENTS)}
                {#each render_state.round.game_events as event}
                    <Card
                        tributes={event.players_involved}
                        message={event.message}
                        grey_if_dead={render_state.greyscale_settings.in_events}
                    />
                {/each}
            {:else if render_state.is(RenderState.ROUND_DEATHS)}
                <p class="text-center mb-12">
                    {#if render_state.has_deaths}
                        {render_state.deaths} cannon shot{render_state.deaths === 1 ? '' : 's'}
                        can be heard in the distance.
                    {:else}
                        No cannon shots can be heard in the distance.
                    {/if}
                </p>
                {#each render_state.tributes_died as tribute}
                    <Card
                        tributes={[tribute]}
                        message={[tribute.name, ' has died this round.']}
                        grey_if_dead={render_state.greyscale_settings.end_of_day_summary}
                    />
                {/each}
            {:else if render_state.is(RenderState.WINNERS)}
                {#if render_state.has_alive}
                    <Card tributes={render_state.tributes_alive} message={FormatWinners()} />
                {:else}
                    <div class="mb-12 flex flex-col justify-center">
                        <Message parts={['There are no survivors.']} />
                    </div>
                {/if}
            {:else if render_state.is(RenderState.GAME_DEATHS)}
                <div class="flex flex-col gap-12">
                    {#each render_state.rounds as round, i}
                        <div class="flex flex-col">
                            <h6 class="text-center font-bold mb-0">
                                Round {i + 1}: {TitleCase(round.stage)}
                            </h6>
                            <article class="flex flex-col gap-0 items-center mr-auto ml-auto max-w-2xl text-center">
                                {#each round.game_events.filter(e => e.event.fatalities.length !== 0) as event}
                                    <!-- The extra div avoids the 'p + p' margin -->
                                    <div><Message parts={event.message} /></div>
                                {:else}
                                    <Message parts={['No-one died.']} />
                                {/each}
                            </article>
                        </div>
                    {/each}
                </div>
            {:else if render_state.is(RenderState.STATS)}
                {#if render_state.has_alive}
                    <TributeStatList tributes={render_state.tributes_alive} />
                {/if}
                {#if render_state.has_deaths}
                    {#if render_state.has_alive}
                        <h3 class="mt-24 mb-8 ml-auto mr-auto">The Rest</h3>
                    {/if}
                    <TributeStatList
                        tributes={render_state.tributes_died.toReversed()}
                        grey_if_dead={render_state.greyscale_settings.end_of_game_summary}
                    />
                {/if}
            {:else}
                <p>Internal Error: Invalid render state</p>
            {/if}
        </div>

        <!-- Buttons. -->
        <div class="flex justify-end mt-8">
            <button id="advance-game" class="right-1/2 translate-x-1/2 absolute" onclick={Proceed}>Proceed</button>
            <button id="abort-game" class="danger-button" onclick={AbortGame}>Abort Game</button>
        </div>
    </section>
{:else}
    <p>Something went horribly wrong. This is a bug. </p>
{/if}
<style lang="scss">
    h6 {
        font-size: calc(var(--text-size) * 1.1);
        color: var(--accentlight);
    }

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
