<script lang="ts">
    import Dialog from '$lib/components/dialog/Dialog.svelte';
    import {
        CalculateTributesInvolved,
        Configuration,
        Event as HGSEvent,
        type EventList,
        type EventListKey, GameStage
    } from '$lib/js/hgs.svelte';
    import {TitleCase} from '$lib/js/hgs.svelte.js';
    import SimpleDialog from '$lib/components/dialog/SimpleDialog.svelte';
    import ErrorDialog from '$lib/components/dialog/ErrorDialog.svelte';
    import StoredEventTag = Configuration.V1.StoredEventTag;

    interface Props {
        event_list: EventList
    }

    let {event_list = $bindable()}: Props = $props()
    let dialog: Dialog
    let message_syntax_dialog: SimpleDialog
    let error_dialog: ErrorDialog

    let stage: EventListKey = $state(GameStage.BLOODBATH)
    let message: string = $state('')
    let deaths: string = $state('')
    let killers: string = $state('')

    function Parse(s: string): number[] {
        if (s.trim().length === 0) return []
        const vals = s.split(',').map(Number)
        if (vals.some(isNaN)) throw new Error(`List contains invalid number: ${s}`)
        return vals
    }

    function Add() {
        try {
            const deaths_list = Parse(deaths)
            const killers_list = Parse(killers)
            const event = new HGSEvent(message, deaths_list, killers_list, StoredEventTag.Custom)
            event_list[stage] ??= []
            event_list[stage]!!.push(event)
            dialog.resolve()
        } catch (e: any) {
            error_dialog.open(e)
        }
    }
</script>

<ErrorDialog bind:this={error_dialog} />

<SimpleDialog bind:this={message_syntax_dialog} title="Message Syntax">
    <div class="p-4 flex flex-col gap-4">
        <p>
            For an event that involves <code>n</code> players, <code>%0</code> is the name of the 1st
            (!) player, <code>%1</code> that of the second, and so on. Each player has a set of pronouns.
            Currently, a player is considered to be plural (i.e. plural inflexions are used), if their
            pronouns are set to the builtin 'they/...' option.
        </p>
        <p>
            The ‘deaths’ and ‘killers’ are comma-separated lists of the numbers of the players who die in
            or participate in killing someone in an event.
        </p>
        <p>
            There are several formatting codes to access tribute-dependent data: <code>%Xn</code> or
            <code>%n</code>. The <code>n</code> is the number of the player; the 1st player has the number
            <code>0</code>. If there is no <code>X</code>, then you get the name of that player (e.g.
            <code>%2</code> is the name of the 3rd player). Otherwise, <code>X</code> is one of the following:
        </p>
        <ul class="pl-6">
            <li><code>N</code> = nominative; e.g. <code>%N2</code> = ‘he’ if the 3rd player’s pronouns are 'he/…'.</li>
            <li><code>A</code> = accusative; e.g. <code>%A2</code> = ‘him’ if the 3rd player’s pronouns are 'he/…'.</li>
            <li><code>G</code> = genitive; e.g. <code>%G2</code> = ‘his’ if the 3rd player’s pronouns are 'he/…'.</li>
            <li><code>R</code> = reflexive; e.g. <code>%R2</code> = ‘himself’ if the 3rd player’s pronouns are 'he/…'.</li>
            <li><code>e</code> = 3rd person sg. ‘-es’; e.g. <code>bash%e2</code> = ‘bash’ if the 3rd player is plural, and ‘bashes’ otherwise.</li>
            <li><code>s</code> = 3rd person sg. ‘-s’; e.g. <code>drink%s2</code> = ‘drink’ if the 3rd player is plural, and ‘drinks’ otherwise.</li>
            <li><code>y</code> = ‘-y/-ies’; e.g. <code>fl%y2</code> = ‘fly’ if the 3rd player is plural, and ‘flies’ otherwise.</li>
            <li><code>i</code> = ‘is/are’; e.g. <code>%i2</code> = ‘are’ if the 3rd player is plural, and ‘is’ otherwise.</li>
            <li><code>h</code> = ‘has/have’; e.g. <code>%h2</code> = ‘have’ if the 3rd player is plural, and ‘has’ otherwise.</li>
            <li><code>!</code> = ‘isn't/aren't’; e.g. <code>%!2</code> = ‘aren’t’ if the 3rd player is plural, and ‘isn’t’ otherwise.</li>
            <li><code>w</code> = ‘was/were’; e.g. <code>%w2</code> = ‘were’ if the 3rd player is plural, and ‘was’ otherwise.</li>
        </ul>
    </div>
</SimpleDialog>

{#snippet content()}
    <div class="flex flex-col gap-4 w-full">
        <p>
            Specify the data for an event below and then press 'Add' to add it;<br>to view the
            message syntax, click on 'View Message Syntax' below.
        </p>
        <div class="
                grid grid-cols-2 gap-4
                [&>label]:text-right
                [&>input]:p-0.5
             "
             style="grid-template-columns: auto 1fr;"
        >
            <label>Stage</label>
            <select id="stage" bind:value={stage}>
                {#each HGSEvent.list_keys_logical_order as key}
                    <option value={key}>{TitleCase(key)}</option>
                {/each}
            </select>
            <label>Message</label>
            <input type="text" id="message" placeholder="%0 and %1 ambush %2 and %3, killing them both." bind:value={message}>
            <label>Deaths</label>
            <input type="text" id="deaths" placeholder="2, 3" bind:value={deaths}>
            <label>Killers</label>
            <input type="text" id="killers" placeholder="0, 1" bind:value={killers}>
        </div>
    </div>
{/snippet}

{#snippet controls()}
    <button onclick={Add}>Add</button>
    <button onclick={() => message_syntax_dialog.open()}>View Message Syntax</button>
    <button onclick={() => dialog.reject()}>Cancel</button>
{/snippet}

<Dialog
    bind:this={dialog}
    title="Add Event"
    {content}
    {controls}
/>

<button onclick={() => dialog.open().ignore_cancellation()}>Add</button>

<style lang="scss">
    code { color: var(--accentlight); }
    li + li { margin: 0; }
</style>