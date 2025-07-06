<script lang='ts'>
    import SimpleDialog from '$lib/components/dialog/SimpleDialog.svelte';
    import {Configuration, DownloadURL, type EventList, Event, StringToObjectURL, TitleCase} from '$lib/js/hgs.svelte';
    import SingleFileDialog from '$lib/components/dialog/SingleFileDialog.svelte';
    import AddEventDialog from '$lib/components/hgs/AddEventDialog.svelte';
    import {Err, Prompt} from '$lib/js/dialog.svelte';

    interface Props {
        event_list: EventList
    }

    let {event_list = $bindable()}: Props = $props()
    let dialog: SimpleDialog
    let json_file_dialog: SingleFileDialog

    function Clear() {
        Prompt('This will completely delete ALL events. Continue?').and(() => { event_list = {} })
    }

    function DoReset() {
        event_list = Configuration.LoadDefaultConfig()
    }

    function Download() {
        try {
            const data = JSON.stringify(Configuration.Save(event_list), null, 4)
            DownloadURL('hgs-events.json', StringToObjectURL(data))
        } catch (e: any) {
            Err(e)
        }
    }

    function IsEmpty() {
        return Object.keys(event_list).length === 0
    }

    function LoadEvents(config: object, replace: boolean) {
        try {
            console.log("Loading events", config) // Log so users can include this in a potential bug report.
            Configuration.Load(event_list, config as object, replace, false)
            event_list = { ...event_list}
        } catch (e: any) {
            Err(e)
        }
    }

    function Reset() {
        Prompt('This will reset the event list to its builtin state. Continue?').and(DoReset)
    }

    function Upload(replace: boolean) {
        json_file_dialog.open().and(res => {
            // No prompt if there are no events at all or if we’re not replacing anything.
            if (IsEmpty() || !replace) LoadEvents(res.data as object, replace)
            else Prompt('This will replace ALL events with the uploaded ones. Continue?').and(() => {
                LoadEvents(res.data as object, replace)
            })
        })
    }
</script>

<SingleFileDialog
    bind:this={json_file_dialog}
    title='Upload Events'
    type='json'
/>

<SimpleDialog bind:this={dialog} title='Event Settings'>
    <div id="event-dialog-content">
        <div class="flex gap-4 mb-4">
            <AddEventDialog bind:event_list />
            <button onclick={() => Upload(false)}>Add from File</button>
            <button onclick={Clear} disabled={IsEmpty()}>Clear</button>
            <button onclick={Download} disabled={IsEmpty()}>Download</button>
            <button onclick={Reset}>Reset</button>
            <button onclick={() => Upload(true)}>Upload and Replace</button>
        </div>
        <p>
            You can add, enable, disable, download, and upload events here; all events that are
            currently loaded are shown below. When events are uploaded, duplicate events are automatically
            filtered out; if you e.g. upload the same event list twice in a row, the second upload will
            do nothing.
        </p>
        <table class="table-no-style">
            <colgroup>
                <col class="w-6">
                <col>
                <col class="w-24">
            </colgroup>
            <thead>
                <tr>
                    <th></th>
                    <th>Message</th>
                    <th>Players</th>
                    <th>Deaths</th>
                    <th>Killers</th>
                </tr>
            </thead>
            <tbody>
            {#each Event.list_keys_logical_order as key}
                <tr class="list-name">
                    <td></td>
                    <td colspan="0">{TitleCase(key)}</td>
                </tr>
                {#each event_list[key] ?? [] as event}
                    <tr class="event-entry" onclick={() => event.enabled = !event.enabled}>
                        <td><input type="checkbox" bind:checked={event.enabled}></td>
                        <td>{event.message}</td>
                        <td>{event.players_involved}</td>
                        <td>{event.fatalities.join(',')}</td>
                        <td>{event.killers.join(',')}</td>
                    </tr>
                {:else}
                    <tr>
                        <td></td>
                        <td>(empty)</td>
                    </tr>
                {/each}
            {/each}
            </tbody>
        </table>
    </div>
</SimpleDialog>

<button onclick={() => dialog.open()}>Edit Events</button>

<style lang="scss">
    #event-dialog-content { --text-size: var(--text-large); }
    th, td { font-size: var(--text-size); }

    .list-name {
        font-weight: bold;
        border-bottom: 1px solid var(--accentlighter);
        &:not(:first-child) td { padding-top: 2rem; } // Can’t add padding to <tr>s ...
    }

    .event-entry:hover {
        cursor: pointer;
        outline: 1px solid var(--accentlighter);
    }
</style>