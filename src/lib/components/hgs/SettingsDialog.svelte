<script lang='ts'>
    import SimpleDialog from '$lib/components/dialog/SimpleDialog.svelte';
    import {type RequiredFatalities, RequiredFatalitiesMode} from '$lib/js/hgs';

    let dialog: SimpleDialog
    let deaths_per_round_mode: RequiredFatalitiesMode = $state(RequiredFatalitiesMode.Disable)
    let deaths_per_round_value: number | null | undefined = $state(null)

    export function open() { dialog.open() }
    export function deaths_per_round(): RequiredFatalities {
        return {
            mode: deaths_per_round_mode,
            value: deaths_per_round_value ?? NaN,
        }
    }
</script>

<SimpleDialog bind:this={dialog} title='Settings'>
    <div class='flex flex-col gap-4'>
        <p style='max-width: 50ch;'>
            Hover over the names of settings (e.g. ‘Deaths per Round’) for a more detailed description.
        </p>
        <div><button>Edit Events</button></div>
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
    </div>
</SimpleDialog>