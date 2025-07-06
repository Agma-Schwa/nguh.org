<script lang="ts">
    import Stripe from '$lib/components/Stripe.svelte';
    import Page from '$lib/components/Page.svelte';
    import {page} from '$app/state';
    import {invalidateAll} from '$app/navigation';
    import {EnableAdminMode, UŊMakeRequest} from '$lib/js/uŋ.svelte';
    import type {Meeting, MeetingParticipant, MemberProfile, MotionNoText} from '$lib/js/ung_types';
    import MotionList from '$lib/components/ung/MotionList.svelte';
    import MemberList from '$lib/components/ung/MemberList.svelte';
    import {Err, Prompt} from '$lib/js/dialog.svelte';

    let admin = $derived(page.data.admin && EnableAdminMode())
    let meetings: Meeting[] = $derived(page.data.meetings)
    let members: MemberProfile[] = $derived(page.data.members)
    let motions: MotionNoText[] = $derived(page.data.motions.filter(m => m.meeting === page.data.running))
    let participants: MeetingParticipant[] = $derived(page.data.participants)
    let name: string = ''
    let active: string = ''
    let select_participant: string = $state('')

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

    async function SetActiveMeeting() {
        const res = await UŊMakeRequest('admin/meeting', 'PUT', { value: Number(active) })
        HandleStartEndResponse(res, true)
    }

    async function CreateMeeting() {
        Prompt(`Create meeting ${name}?`).and(async () => {
            const res = await UŊMakeRequest("admin/meeting", "POST", { date: name })
            name = ''
            HandleStartEndResponse(res)
        })
    }

    async function ToggleAbsentia() {
        console.log(page.data.absentia)
        const res = await UŊMakeRequest(`admin/meeting/absentia/${!page.data.absentia ? 1 : 0}`, 'PATCH')
        HandleStartEndResponse(res)
    }

    async function ResetParticipants() {
        Prompt('Reset participant list?').and(async () => {
            const res = await UŊMakeRequest(`admin/participants/reset`, 'POST')
            HandleStartEndResponse(res)
        })
    }

    async function AddParticipant() {
        if (select_participant.length === 0) return
        const res = await UŊMakeRequest(`admin/participant/${select_participant}`, 'PUT')
        HandleStartEndResponse(res)
        select_participant = ''
    }

    async function RemoveParticipant(m: MemberProfile) {
        const res = await UŊMakeRequest(`admin/participant/${m.discord_id}`, 'DELETE')
        HandleStartEndResponse(res)
    }
</script>

<Page name='UŊ' />
<Stripe>Meeting</Stripe>

<section>
    {#if admin && page.data.running}
        <div class='flex justify-center gap-8 mb-8'>
            <button onclick={EndMeeting}>End Meeting</button>
            <button onclick={ToggleAbsentia}>
                {!page.data.absentia ? 'Enable' : 'Disable'} In-Absentia Voting
            </button>
            <button onclick={ResetParticipants}>Reset Participants</button>
        </div>
    {/if}

    <div class='mb-5'>
        {#if !page.data.running}
            <p>
                No meeting is currently active.
                {#if !admin} Please wait until an administrator creates the next meeting. {/if}
            </p>
            {#if admin}
                <p> Looks like you have admin privileges! To start a meeting, press 'Set Active Meeting' above. </p>
            {/if}
        {:else}
            <h3>Agenda for Meeting #{page.data.running}</h3>
            <MotionList
                interactive={false}
                {motions}
                {members}
            />
        {/if}
    </div>

    {#if admin && !page.data.running}
        <div class='admin-buttons'>
            <div>
                <button onclick={SetActiveMeeting}>Set Active Meeting</button>
                <select bind:value={active}>
                    {#each meetings as meeting}
                        <option value='{meeting.id}'>#{meeting.id} — {meeting.date}</option>
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

{#if page.data.running && participants.length !== 0}
    <Stripe>Participants</Stripe>
    <section>
        {#if admin}
            <div class='mb-8 admin-buttons'>
                <div>
                    <button onclick={AddParticipant}>Add Participant</button>
                    <select bind:value={select_participant}>
                        {#each members.filter(m => !participants.find(p => p.member === m.discord_id)).sort() as member}
                            <option value={member.discord_id}>{member.display_name}</option>
                        {/each}
                    </select>
                </div>
            </div>
        {/if}
        <MemberList
            editable={admin}
            members={participants.map(participant => members.find(m => m.discord_id === participant.member)).filter(m => m !== undefined)}
            can_be_removed={m => !participants.find(p => p.member === m.discord_id)?.absentee_voter}
            do_remove={RemoveParticipant}
        />
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