<script lang='ts'>
    import SimpleDialog from '$lib/components/dialog/SimpleDialog.svelte';
    import {
        type EventList,
        GameSettings,
        RequiredFatalitiesMode
    } from '$lib/js/hgs.svelte';
    import EditEventsDialog from '$lib/components/hgs/EditEventsDialog.svelte';
    import Checkbox from '$lib/components/Checkbox.svelte';

    interface Props {
        event_list: EventList,
    }

    let {event_list = $bindable()}: Props = $props()
    let dialog: SimpleDialog
    let day_override: boolean = $state(GameSettings.value.starting_day !== undefined)
    let day: number = $state(GameSettings.value.starting_day ?? 1)
    let actual_day = $derived(day_override ? day : undefined)
    $effect(() => { GameSettings.value.starting_day = actual_day })

    export function open() { dialog.open() }
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
            <select bind:value={GameSettings.value.required_fatalities_mode}>
                <option value='{RequiredFatalitiesMode.Disable}'>Disable</option>
                <option value='{RequiredFatalitiesMode.Percent}'>Percent (max: 100)</option>
                <option value='{RequiredFatalitiesMode.Absolute}'>Players</option>
            </select>
            <input
                bind:value={GameSettings.value.required_fatalities}
                type='number'
                max='100'
                disabled={GameSettings.value.required_fatalities_mode === RequiredFatalitiesMode.Disable}
            >
        </fieldset>

        <fieldset>
            <legend>
                <abbr title='Set the starting day and/or stage for the game.'>
                    Start Options
                </abbr>
            </legend>

            <div class='flex gap-1'>
                <Checkbox bind:checked={day_override}>Start On Day</Checkbox>
                <input type='number' id='day_override' min='1' placeholder='e.g. 1' disabled={!day_override} bind:value={day}>
            </div>
        </fieldset>

        <fieldset>
            <legend>
                <abbr title='When to use greyscale portraits for dead tributes.'>Greyscale Portraits</abbr>
            </legend>
            <Checkbox bind:checked={GameSettings.value.greyscale_settings.in_events}>In Events</Checkbox>
            <Checkbox bind:checked={GameSettings.value.greyscale_settings.end_of_day_summary}>At End of Day</Checkbox>
            <Checkbox bind:checked={GameSettings.value.greyscale_settings.end_of_game_summary}>At End of Game</Checkbox>
        </fieldset>
    </div>
</SimpleDialog>

<style>
    fieldset {
        margin: 0;
        user-select: none;
        width: 100%;
    }

    input[type=text], input[type=number] {
        padding-inline: 2px;
    }
</style>