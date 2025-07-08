<script lang='ts'>
    import Page from '$lib/components/Page.svelte';
    import Stripe from '$lib/components/Stripe.svelte';
    import type {EditNation, MemberProfile, Nation, NationMemberProfile} from '$lib/js/ung_types';
    import {page} from '$app/state';
    import {EnableAdminMode, UŊMakeRequest} from '$lib/js/uŋ.svelte';
    import Dialog from '$lib/components/dialog/Dialog.svelte';
    import {invalidateAll} from '$app/navigation';
    import MemberList from '$lib/components/ung/MemberList.svelte';
    import {Err, Prompt} from '$lib/js/dialog.svelte';
    import {form} from '$lib/js/uŋ.svelte';

    let add_member: Dialog
    let nation: Nation = $derived(page.data.nation)
    let reps: NationMemberProfile[] = $derived(page.data.reps)
    let my_rep: NationMemberProfile | undefined = $derived(reps.find(r => r.discord_id === page.data.user.id))
    let admin = $derived(page.data.admin && EnableAdminMode())
    let all_members: MemberProfile[] = $state([])
    let selected_member: string = $state('')
    let ruler_checkbox: boolean = $state(false)
    let editor = $derived(admin || my_rep?.ruler)
    let edit_mode: boolean = $state(false)

    // Not $derived() because we want to be able to edit it.
    let edit_name: string = $state(nation.name)
    let edit_banner_url: string = $state(nation.banner_url ?? '')

    async function AddMember() {
        // Only show members that are not already representatives and not already rulers.
        const res = await UŊMakeRequest('members')
        all_members = (await res.json() as MemberProfile[]).filter(m => !reps.find(r => r.ruler && r.discord_id === m.discord_id))
        add_member.open().and(async () => {
            if (selected_member.length === 0) return;
            const res = await UŊMakeRequest(`nation/${nation.id}/member/${selected_member}`, 'PUT', { value: ruler_checkbox })
            selected_member = ''
            switch (res.status) {
                default: Err(`Unexpected Error ${res.status}: ${await res.text()}`); break
                case 423: Err('Inactive ŋations cannot be modified'); break
                case 422: Err('You cannot add this user to a ŋation'); break
                case 409: Err('This member is already a representative for this ŋation.'); break;
                case 404: Err('The specified member could not be found.'); break;
                case 204: await invalidateAll(); break;
            }
        })
    }

    async function RemoveMember(m: NationMemberProfile) {
        Prompt(
            m.discord_id === page.data.user.id
                ? `Are you sure you want to leave this ŋation?`
                : `Are you sure you want to remove ${m.display_name}?`
        ).and(async () => {
            const res = await UŊMakeRequest(`nation/${nation.id}/member/${m.discord_id}`, 'DELETE')
            switch (res.status) {
                default: Err(`Unexpected Error ${res.status}: ${await res.text()}`); break
                case 423: Err('Inactive ŋations cannot be modified'); break
                case 404: Err('The specified member could not be found or is not a representative.'); break;
                case 204: await invalidateAll(); break;
            }
        })
    }

    async function Leave() {
        if (my_rep) await RemoveMember(my_rep)
    }

    async function Edit() {
        const res = await UŊMakeRequest(`nation/${nation.id}`, 'PATCH', {
            name: edit_name,
            banner_url: edit_banner_url,
        } satisfies EditNation)
        edit_mode = false
        if (res.ok) await invalidateAll();
        else switch (res.status) {
            default: Err(`Unexpected Error ${res.status}: ${await res.text()}`); break
            case 423: Err('Inactive ŋations cannot be modified'); break
            case 413: Err('One or more fields are too long!'); break;
            case 470: Err('One or more required field is empty!'); break;
        }
    }
</script>

<Dialog title='Add Member' bind:this={add_member}>
    {#snippet content()}
        Choose a member to add as a representative.
        <select bind:value={selected_member}>
            {#each all_members as member}
                <option value={member.discord_id}>{member.display_name}</option>
            {/each}
        </select>
        <label>
            <input type='checkbox' bind:checked={ruler_checkbox}>
            Add as a ruler
        </label>
    {/snippet}
    {#snippet controls()}
        <button onclick={() => add_member.resolve()}>Add</button>
        <button onclick={() => add_member.reject()}>Cancel</button>
    {/snippet}
</Dialog>

<Page name='UŊ'></Page>
<Stripe>{nation.name}</Stripe>
<section>
    {#if edit_mode}
        <form method='POST' use:form={Edit}>
            <label>Name</label>
            <input type='text' minlength='1' maxlength='200' required bind:value={edit_name}>

            <label>Banner URL</label>
            <input type='url' maxlength='6000' bind:value={edit_banner_url} placeholder='Enter Banner URL here...'>
            {#if URL.canParse(edit_banner_url)}
                <div class='flex justify-center mt-8'>
                    <img src={edit_banner_url} alt='Map Image' class='w-20 non-previewable-icon' />
                </div>
            {/if}

            <div class='flex justify-center mt-6 -mb-8 gap-8'>
                <input type='submit' value='Update' class='w-32 border-none' />
                <button onclick={() => edit_mode = false}>Cancel</button>
            </div>
        </form>
    {:else}
        <div class='flex'>
            <img src={nation.banner_url} class='w-32 mx-auto' style='image-rendering: crisp-edges;'>
        </div>

        <h2 class='mt-12'>Representatives</h2>
        <MemberList
            editable={editor}
            members={reps}
            can_be_removed={m => admin || !m.ruler}
            do_remove={m => RemoveMember(m)}
        />

        <div class='flex gap-4 mt-4'>
            {#if editor}
                <button onclick={AddMember}>Add Member</button>
                <button onclick={() => edit_mode = true}>Edit Ŋation</button>
            {/if}
            {#if my_rep}
                <button onclick={Leave} class='{my_rep.ruler ? "text-white bg-rose-800" : ""}'>Leave Ŋation</button>
            {/if}
        </div>
    {/if}
</section>