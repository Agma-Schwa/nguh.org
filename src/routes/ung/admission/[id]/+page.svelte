<script lang='ts'>
    import Page from '$lib/components/Page.svelte';
    import Stripe from '$lib/components/Stripe.svelte';
    import type {Admission, AdmissionFormRequestBody, MemberProfile, Vote} from '$lib/js/ung_types';
    import {page} from '$app/state';
    import Member from '$lib/components/ung/Member.svelte';
    import {EnableAdminMode, MarkdownInstance, UŊMakeRequest, UŊMakeRequestAndCheckErr} from '$lib/js/uŋ.svelte';
    import EditAdmission from '$lib/components/ung/EditAdmission.svelte';
    import {goto, invalidateAll} from '$app/navigation';
    import {Err, Prompt} from '$lib/js/dialog.svelte';
    import Dialog from '$lib/components/dialog/Dialog.svelte';
    import NationCard from '$lib/components/ung/NationCard.svelte';

    let admission: Admission = $derived(page.data.admission)
    let admin: boolean = $derived(page.data.admin && EnableAdminMode())
    let me: MemberProfile | null = $derived(page.data.me)
    let edit_mode: boolean = $state(false)
    let votes: Vote[] = $derived(page.data.votes)
    let ayes = $derived(votes.filter(v => v.vote).length)
    let dialog: Dialog

    async function Edit(data: AdmissionFormRequestBody) {
        const res = await UŊMakeRequest(`admission/${admission.id}`, 'PATCH', data)
        edit_mode = false
        if (res.ok) await invalidateAll()
        else switch (res.status) {
            default: Err(`Error ${res.status}`); break
            case 401: Err('You must be logged in to fill in this form'); break
            case 403: Err('You don’t have the permissions to edit this admission!'); break
            case 413: Err('One or more fields are too long!'); break;
            case 470: Err('One or more required field is empty!'); break;
        }
    }

    function Pass() {
        Prompt(`Pass the admission for ${admission.name}?`).and(async () => {
            await UŊMakeRequestAndCheckErr(`admin/admission/${admission.id}/pass`, 'POST')
        })
    }

    function Delete() {
        Prompt("Are you sure you want to delete your admission? This cannot be undone!").and(async () => {
            await UŊMakeRequestAndCheckErr(`admission/${admission.id}`, 'DELETE')
            await goto('/ung/admissions', { replaceState: true, invalidateAll: true})
        })
    }

    function Vote() {
        dialog.open().and(async (vote: boolean) => {
            await UŊMakeRequestAndCheckErr(`admission/${admission.id}/vote/${vote ? 1 : 0}`, 'PUT')
        })
    }
</script>

<Dialog bind:this={dialog} title='Vote'>
    {#snippet controls()}
        <button onclick={() => dialog.resolve(true)} class='bg-green-800 text-white'>Aye</button>
        <button onclick={() => dialog.reject()}>Cancel</button>
        <button onclick={() => dialog.resolve(false)} class='bg-rose-800 text-white'>No</button>
    {/snippet}
    {#snippet content()}
        <p>Vote in favour of this nation being admitted?</p>
    {/snippet}
</Dialog>

<Page name='UŊ'></Page>
<Stripe>Admission</Stripe>
<section>
    {#if edit_mode}
        <EditAdmission
            on_submit={Edit}
            name={admission.name}
            ruler={admission.ruler}
            banner_text={admission.banner_text}
            banner_url={admission.banner_url}
            claim_text={admission.claim_text}
            claim_url={admission.claim_url}
            trivia={admission.trivia}
        />
    {:else}
        <h3 class='text-4xl'>{admission.name}</h3>
        {#if admission.ruler}
            <h4 class='text-center text-2xl mt-4'>
                <em>ruled by</em>
                <span style='font-variant: small-caps'>{admission.ruler}</span>
            </h4>
        {/if}
        <div class='mb-8 mt-6'>
            <div class='mx-auto w-fit'>
                <Member member={admission.author} />
            </div>
        </div>
        {#if admission.banner_url}
            <div class='flex mt-8'>
                <img src={admission.banner_url} class='w-32 mx-auto banner'>
            </div>
        {/if}
            <h3 class='text-left'>Votes</h3>
            <div class=' mb-8'>
                <p>Ayes: {ayes}, Noes: {votes.length - ayes}</p>
                <div class='grid gap-4 leading-8 items-center' style='grid-template-columns: auto 1fr'>
                    {#each votes as vote}
                        <div><NationCard nation={vote.nation} member={vote.member}/></div>
                        <div>{vote.vote ? '✅' : '❌'}</div>
                    {/each}
                </div>

                {#if admission.closed}
                    {#if admission.passed}
                        <p class='mt-4 text-green-600'><strong>ADMITTED</strong></p>
                    {:else}
                        <p class='mt-4 text-rose-600'><strong>REJECTED</strong></p>
                    {/if}
                {/if}
            </div>
        <h3 class='mt-12 text-left'>Claims</h3>
        {#if admission.claim_text || admission.claim_url}
            {#if admission.claim_text}
                {@html MarkdownInstance.render(admission.claim_text)}
            {/if}
            {#if admission.claim_url}
                <div class='flex justify-center mt-8'>
                    <div class='w-1/2 min-w-5 min-h-5' style='border: var(--ridge-border);'>
                        <img src={admission.claim_url} alt='Map Image' class='w-full non-previewable-icon' />
                    </div>
                </div>
            {/if}
        {:else}
            None given.
        {/if}
        {#if admission.trivia}
            <h3 class='mt-12 text-left'>Description</h3>
            {@html MarkdownInstance.render(admission.trivia)}
        {/if}
        <div class='flex mt-8 justify-center gap-8'>
            {#if !admission.closed && me?.represented_nation && me.discord_id !== admission.author.discord_id}
                <button onclick={Vote}>Vote</button>
            {/if}
            {#if admin || (page.data.user.id === admission.author.discord_id && !admission.closed)}
                <button onclick={() => edit_mode = true}>Edit</button>
                {#if admin}
                    <button onclick={Pass} class='text-white bg-green-800'>Pass Admission</button>
                {/if}
                <button onclick={Delete} class='text-white bg-rose-800'>Delete Admission</button>
            {/if}
        </div>
    {/if}
</section>