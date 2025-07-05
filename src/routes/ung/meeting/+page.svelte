<script lang="ts">
    import Stripe from '$lib/components/Stripe.svelte';
    import Page from '$lib/components/Page.svelte';
    import {page} from '$app/state';
    import {invalidateAll} from '$app/navigation';
    import ErrorDialog from '$lib/components/dialog/ErrorDialog.svelte';
    import {EnableAdminMode} from '$lib/js/uŋ.svelte';

    let error: ErrorDialog
    let admin = $derived(page.data.admin && EnableAdminMode())

    function HandleStartEndResponse(res: Response, enable: boolean) {
        switch (res.status) {
            case 500: error.open("Internal Server Error"); break;
            case 409: error.open(`Meeting is ${enable ? "already" : "not"} running!`); break
            case 204: invalidateAll(); break;
        }
    }

    async function EndMeeting() {
        const res = await fetch(`/ung/api/meeting`, { method: 'DELETE' })
        HandleStartEndResponse(res, false)
    }

    async function StartMeeting() {
        const res = await fetch(`/ung/api/meeting`, { method: 'PUT' })
        HandleStartEndResponse(res, true)
    }
</script>

<Page name='UŊ' />
<Stripe>Meeting</Stripe>

<ErrorDialog bind:this={error} />

<section>
    <div class='mb-5'>
        {#if admin}
            {#if page.data.running}
                <button onclick={EndMeeting}>End Meeting</button>
            {:else}
                <button onclick={StartMeeting}>Start Meeting</button>
            {/if}
        {/if}
    </div>

    {#if !page.data.running}
        <p>
            No meeting is currently in progress.
            {#if !admin} Please wait until the designated time for the next meeting. {/if}
        </p>
        {#if admin}
            <p> Looks like you have admin privileges! To start the meeting, press 'Start Meeting' above. </p>
        {/if}
    {/if}
</section>
