<script lang="ts">
    import Stripe from '$lib/components/Stripe.svelte';
    import Page from '$lib/components/Page.svelte';
    import {page} from '$app/state';
    import {invalidateAll} from '$app/navigation';
    import {EnableAdminMode, LockMotion, UŊMakeRequest, UŊMakeRequestAndCheckErr} from '$lib/js/uŋ.svelte';
    import type {Meeting, MeetingParticipant, MemberProfile, MotionNoText, Nation} from '$lib/js/ung_types';
    import MotionList from '$lib/components/ung/MotionList.svelte';
    import {Err, Prompt} from '$lib/js/dialog.svelte';
    import NationCard from '$lib/components/ung/NationCard.svelte';
    import XButton from '$lib/components/ung/XButton.svelte';

    let admin = $derived(page.data.admin && EnableAdminMode())
    let meetings: Meeting[] = $derived(page.data.meetings)
    let members: MemberProfile[] = $derived(page.data.members)
    let motions: MotionNoText[] = $derived(page.data.motions.filter(m => m.meeting === page.data.running))
    let active_meeting: Meeting | undefined = $derived(meetings.find(m => m.id === page.data.running))
    let participants: MeetingParticipant[] = $derived(page.data.participants)
    let me = $derived(members.find(m => m.discord_id === page.data.user.id))
    let name: string = $state('')
    let active: string = $state('')

    function HandleStartEndResponse(res: Response, enable?: boolean) {
        switch (res.status) {
            case 500: Err("Internal Server Error"); break;
            case 409: Err(`Meeting is ${enable ? "already" : "not"} running!`); break
            case 204: invalidateAll(); break;
        }
    }

    async function EndMeeting() {
        const res = await UŊMakeRequest('admin/meeting', 'DELETE')
        HandleStartEndResponse(res, false)
    }

    async function LockMotions() {
        for (const m of motions) await LockMotion(m.id, true)
    }

    async function SetActiveMeeting() {
        const res = await UŊMakeRequest('admin/meeting', 'PUT', { value: Number(active) })
        HandleStartEndResponse(res, true)
    }

    async function CreateMeeting() {
        Prompt(`Create meeting ${name}?`).and(async () => {
            await UŊMakeRequestAndCheckErr("admin/meeting", "POST", { date: name })
            name = ''
        })
    }

    async function ToggleAbsentia() {
        await UŊMakeRequestAndCheckErr(`admin/meeting/absentia/${!page.data.absentia ? 1 : 0}`, 'PATCH')
    }

    async function ResetParticipants() {
        Prompt('Reset participant list?').and(async () => {
            await UŊMakeRequestAndCheckErr(`admin/participants/reset`, 'POST')
        })
    }

    async function Join() {
        if (me?.represented_nation) await UŊMakeRequestAndCheckErr(`participant/${me.represented_nation}`, 'PUT')
    }

    async function RemoveParticipant(m: MeetingParticipant) {
        await UŊMakeRequestAndCheckErr(`participant/${m.nation.id}`, 'DELETE')
    }

    function ClearInAbsentiaVotes(m: MeetingParticipant) {
        Prompt(
            `Delete ALL of ${m.nation.name}’s pending in-absentia votes for the current meeting?`
        ).and(async () => {
            await UŊMakeRequestAndCheckErr(`participant/${m.nation.id}/absentia`, 'DELETE')
        })
    }
</script>

<Page name='UŊ' />
<Stripe>Meeting</Stripe>

<section>
    {#if admin && active_meeting}
        <div class='flex justify-center gap-8 mb-8'>
            <button onclick={EndMeeting}>End Meeting</button>
            {#if motions.find(m => !m.locked)}
                <button onclick={LockMotions}>Lock Motions</button>
            {/if}
            <button onclick={ToggleAbsentia}>
                {!page.data.absentia ? 'Enable' : 'Disable'} In-Absentia Voting
            </button>
            {#if !page.data.absentia}
                <button onclick={ResetParticipants}>Reset Participants</button>
            {/if}
        </div>
    {/if}

    <div class='mb-5'>
        {#if !active_meeting}
            <p>
                No meeting is currently active.
                {#if !admin} Please wait until an administrator creates the next meeting. {/if}
            </p>
        {:else}
            <h3>Agenda for Meeting {active_meeting.name}</h3>
            <MotionList
                interactive={false}
                {motions}
                {members}
                {meetings}
            />
        {/if}
    </div>

    {#if admin && !active_meeting}
        <div class='admin-buttons'>
            <div>
                <button onclick={SetActiveMeeting}>Set Active Meeting</button>
                <select bind:value={active}>
                    {#each meetings as meeting}
                        <option value='{meeting.id}'>{meeting.name}</option>
                    {/each}
                </select>
            </div>
            <div>
                <button onclick={CreateMeeting}>Create Meeting</button>
                <input bind:value={name} type='text'>
            </div>
        </div>
    {/if}
</section>

{#if active_meeting && !page.data.absentia}
    {@const my_part = participants.find(p => p.nation.id === me?.represented_nation)}
    {@const sorted = my_part ? [my_part, ...participants.filter(p => p !== my_part)] : participants}
    <Stripe>Participants</Stripe>
    <section>
        {#if me?.represented_nation}
            {#if !my_part}
                <div class='flex'>
                    <button class='mb-6 mx-auto' onclick={Join}>Join Meeting</button>
                </div>
            {:else if !my_part.absentee_voter}
                <div class='flex'>
                    <button class='mb-6 mx-auto' onclick={() => RemoveParticipant(my_part) }>Leave Meeting</button>
                </div>
            {:else}
                <div class='flex'>
                    <button class='mb-6 mx-auto' onclick={() => ClearInAbsentiaVotes(my_part)}>Clear In-Absentia Votes</button>
                </div>
            {/if}
        {/if}
        {#each sorted as participant}
            <div class='flex flex-row items-center gap-1.5 mt-4'>
                {#if admin}
                    <XButton
                        enabled={!participant.absentee_voter}
                        onclick={() => RemoveParticipant(participant)}
                    />
                {/if}
                <NationCard nation={participant.nation} />
                {#if participant.absentee_voter}
                    <p class='text-2xl italic'>(in absentia)</p>
                {/if}
            </div>
        {/each}
    </section>
{/if}


<style lang='scss'>
    .admin-buttons {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        button {
            width: 13rem;
            margin-right: 1rem;
        }

        input { padding-left: .25rem; }
        input, select {
            width: 20rem;
            border: 1px solid var(--accentcolour);
        }
    }
</style>