<script lang='ts'>
    import Page from '$lib/components/Page.svelte';
    import Stripe from '$lib/components/Stripe.svelte';
    import type {Admission, AdmissionFormRequestBody} from '$lib/js/ung_types';
    import {page} from '$app/state';
    import Member from '$lib/components/ung/Member.svelte';
    import {EnableAdminMode, UŊMakeRequest} from '$lib/js/uŋ.svelte';
    import EditAdmission from '$lib/components/ung/EditAdmission.svelte';
    import {invalidateAll} from '$app/navigation';
    import {Err} from '$lib/js/dialog.svelte';

    let admission: Admission = $derived(page.data.admission)
    let admin: boolean = $derived(page.data.admin && EnableAdminMode())
    let edit_mode: boolean = $state(false)

    async function Edit(data: AdmissionFormRequestBody) {
        const res = await UŊMakeRequest(`admission/${admission.id}`, 'PATCH', data)
        edit_mode = false
        if (res.ok) await invalidateAll()
        else switch (res.status) {
            default: Err(`Error ${res.status}`); break
            case 401: Err('You must be logged in to fill in this form'); break
            case 403: Err('You don’t have the permissions to edit this admission!'); break
            case 413: Err('One or more fields is too long!'); break;
            case 470: Err('One or more required field is empty!'); break;
        }
    }
</script>

<Page name='UŊ'></Page>
<Stripe>Admission</Stripe>
<section>
    {#if edit_mode}
        <EditAdmission data={admission} on_submit={Edit}></EditAdmission>
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
                <img src={admission.banner_url} class='w-32 mx-auto' style='image-rendering: crisp-edges;'>
            </div>
        {/if}
        <h3 class='mt-12 text-left'>Claims</h3>
        {#if admission.claim_text || admission.claim_url}
            <p>{admission.claim_text}</p>
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
            {admission.trivia}
        {/if}
        {#if admin || (page.data.user.id === admission.author.discord_id)}
            <div class='flex justify-center'>
                <button onclick={() => edit_mode = true}>Edit</button>
            </div>
        {/if}
    {/if}
</section>