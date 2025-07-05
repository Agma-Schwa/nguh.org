<script lang="ts">
    import Stripe from '$lib/components/Stripe.svelte';
    import Page from '$lib/components/Page.svelte';
    import {page} from '$app/state';
    import {invalidateAll} from '$app/navigation';
    import ErrorDialog from '$lib/components/dialog/ErrorDialog.svelte';
    import {EnableAdminMode, LockMotion, UŊMakeRequest} from '$lib/js/uŋ.svelte';
    import type {Meeting, MotionNoText} from '$lib/js/ung_types';
    import ConfirmDialog from '$lib/components/dialog/ConfirmDialog.svelte';
    import MotionList from '$lib/components/ung/MotionList.svelte';

    let error: ErrorDialog
    let confirm: ConfirmDialog;
    let admin = $derived(page.data.admin && EnableAdminMode())
    let meetings: Meeting[] = $derived(page.data.meetings)
    let motions: MotionNoText[] = $derived(page.data.motions.filter(m => m.meeting === page.data.running))
    let name: string = ''
    let active: string = ''

    function HandleStartEndResponse(res: Response, enable?: boolean) {
        switch (res.status) {
            case 500: error.open("Internal Server Error"); break;
            case 409: error.open(`Meeting is ${enable ? "already" : "not"} running!`); break
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
        confirm.open(`Create meeting ${name}?`).and(async () => {
            const res = await UŊMakeRequest("admin/meeting", "POST", { date: name })
            name = ''
            HandleStartEndResponse(res)
        })
    }
</script>

<Page name='UŊ' />
<Stripe>Meeting</Stripe>

<ErrorDialog bind:this={error} />
<ConfirmDialog bind:this={confirm} />

<section>
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
                motions={motions}
                members={page.data.members}
            />
        {/if}
    </div>

    {#if admin}
        {#if page.data.running}
            <button onclick={EndMeeting}>End Meeting</button>
        {:else}
            <div id='admin-buttons'>
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
    {/if}
</section>


<style lang='scss'>
    #admin-buttons {
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