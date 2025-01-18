<script lang='ts'>
    import SimpleDialog from '$lib/components/dialog/SimpleDialog.svelte';
    import type {EventList} from '$lib/js/hgs.svelte';

    interface Props {
        event_list: EventList
    }

    let {event_list = $bindable()}: Props = $props()
    let dialog: SimpleDialog

    // We don’t use 'Object.keys' because we want a custom sort order for
    // these (the three main stages of the game first, then special events
    // like feast, and the 'all' list at the very end).
    let keys = ['bloodbath', 'day', 'night', 'feast','all'] satisfies (keyof EventList)[]
</script>

<SimpleDialog bind:this={dialog} title='Event Settings'>
    <div id="event-dialog-content">
        <p>You can add, enable, disable, download, and upload events below.</p>
        <table class="table-no-style">
            <colgroup>
                <col class="w-6">
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
            {#each keys as key}
                <tr class="list-name">
                    <td></td>
                    <td colspan="0">{key.slice(0, 1).toUpperCase() + key.slice(1)}</td>
                </tr>
                {#each event_list[key] ?? [] as event}
                    <tr class="event-entry" onclick={() => event.enabled = !event.enabled}>
                        <td><input type="checkbox" bind:checked={event.enabled}></td>
                        <td>{event.message}</td>
                        <td>{event.players_involved}</td>
                        <td>{event.fatalities.join(',')}</td>
                        <td>{event.killers.join(',')}</td>
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