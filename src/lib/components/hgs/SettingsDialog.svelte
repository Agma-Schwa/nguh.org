<script lang='ts'>
    import SimpleDialog from '$lib/components/dialog/SimpleDialog.svelte';
    import {
        type EventList,
        type EventListKey, GameStage,
        type GameOptions,
        RequiredFatalitiesMode, TitleCase, Game
    } from '$lib/js/hgs.svelte';
    import EditEventsDialog from '$lib/components/hgs/EditEventsDialog.svelte';

    interface Props {
        event_list: EventList
    }

    let {event_list = $bindable()}: Props = $props()
    let dialog: SimpleDialog
    let deaths_per_round_mode: RequiredFatalitiesMode = $state(RequiredFatalitiesMode.Disable)
    let deaths_per_round_value: number | null | undefined = $state(null)
/*    let stage_override: boolean = $state(false)
    let stage: GameStage = $state(GameStage.BLOODBATH)*/
    let day_override: boolean = $state(false)
    let day: number = $state(1)

    export function open() { dialog.open() }
    export function get_options(): GameOptions {
        return {
            required_fatalities_mode: deaths_per_round_mode,
            required_fatalities: deaths_per_round_value ?? NaN,
            starting_day: day_override ? day : undefined
        }
    }
</script>

<SimpleDialog bind:this={dialog} title='Settings'>
    <div class='flex flex-col gap-4'>
        <p style='max-width: 50ch;'>
            Hover over the names of settings (e.g. ‘Deaths per Round’) for a more detailed description.
        </p>
        <div><EditEventsDialog bind:event_list /></div>

        <fieldset>
            <!-- Do NOT indent the second line here as that will indent the text in the tooltip. -->
            <legend>
                <abbr title='The Simulator will try to make sure that this many tributes die each round.
If specified in percent, this is relative to the total number of tributes, alive or dead.'>
                    Deaths per Round
                </abbr>
            </legend>
            <select bind:value={deaths_per_round_mode}>
                <option value='{RequiredFatalitiesMode.Disable}'>Disable</option>
                <option value='{RequiredFatalitiesMode.Percent}'>Percent (max: 100)</option>
                <option value='{RequiredFatalitiesMode.Absolute}'>Players</option>
            </select>
            <input
                bind:value={deaths_per_round_value}
                type='number'
                max='100'
                disabled={deaths_per_round_mode === RequiredFatalitiesMode.Disable}
            >
        </fieldset>

        <fieldset>
            <legend>
                <abbr title='Set the starting day and/or stage for the game.'>
                    Start Options
                </abbr>
            </legend>

            <div class='start-options'>
                <input type='checkbox' bind:checked={day_override}>
                <label for='day_override' class='select-none' onclick={() => day_override = !day_override}>Start on Day</label>
                <input type='number' id='day_override' min='1' placeholder='e.g. 1' disabled={!day_override} bind:value={day}>

                <!--<input type='checkbox' bind:checked={stage_override}>
                <label for='stage_override' class='select-none' onclick={() => stage_override = !stage_override}>Stage</label>
                <select id='stage_override' disabled={!stage_override}>
                    {#each Object.values(GameStage) as stage}
                        <option value='{stage}'>{TitleCase(stage)}</option>
                    {/each}
                </select>-->
            </div>
        </fieldset>
    </div>
</SimpleDialog>

<style>
    fieldset {
        margin: 0;
        user-select: none;
        width: 100%;
    }

    .start-options {
        display: grid;
        grid-template-columns: auto auto 1fr;
        gap: .25rem;
        column-gap: .5rem;
        select, input[type=number] { width: 7.5rem; }
    }
</style>