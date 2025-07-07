<script lang='ts'>
    import Page from '$lib/components/Page.svelte';
    import Stripe from '$lib/components/Stripe.svelte';
    import type {MemberProfile, Nation} from '$lib/js/ung_types';
    import {page} from '$app/state';
    import {EnableAdminMode, UŊMakeRequest} from '$lib/js/uŋ.svelte';
    import Dialog from '$lib/components/dialog/Dialog.svelte';
    import {invalidateAll} from '$app/navigation';
    import MemberList from '$lib/components/ung/MemberList.svelte';
    import {Err, Prompt} from '$lib/js/dialog.svelte';

    let add_member: Dialog
    let nation: Nation = $derived(page.data.nation)
    let reps: MemberProfile[] = $derived(page.data.reps)
    let admin = $derived(page.data.admin && EnableAdminMode())
    let all_members: MemberProfile[] = $state([])
    let selected_member: string = $state('')
    let editor = $derived(admin || reps.find(page.data.user.id))

    async function AddMember() {
        const res = await UŊMakeRequest('members')
        all_members = (await res.json() as MemberProfile[]).filter(m => !reps.find(r => r.discord_id === m.discord_id))
        add_member.open().and(async () => {
            if (selected_member.length === 0) return;
            const res = await UŊMakeRequest(`nation/${nation.id}/member/${selected_member}`, 'PUT')
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

    async function RemoveMember(m: MemberProfile) {
        Prompt(`Are you sure you want to remove ${m.display_name}?`).and(async () => {
            const res = await UŊMakeRequest(`nation/${nation.id}/member/${m.discord_id}`, 'DELETE')
            switch (res.status) {
                default: Err(`Unexpected Error ${res.status}: ${await res.text()}`); break
                case 423: Err('Inactive ŋations cannot be modified'); break
                case 404: Err('The specified member could not be found or is not a representative.'); break;
                case 204: await invalidateAll(); break;
            }
        })
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
    {/snippet}
    {#snippet controls()}
        <button onclick={() => add_member.resolve()}>Add</button>
        <button onclick={() => add_member.reject()}>Cancel</button>
    {/snippet}
</Dialog>

<Page name='UŊ'></Page>
<Stripe>{nation.name}</Stripe>
<section>
    <div class='flex'>
        <img src={nation.flag_url} class='w-32 mx-auto' style='image-rendering: crisp-edges;'>
    </div>

    <h2 class='mt-12'>Representatives</h2>
    <MemberList
        editable={editor}
        members={reps}
        can_be_removed={() => true}
        do_remove={m => RemoveMember(m)}
    />

    {#if editor}
        <button onclick={AddMember} class='mt-4'>Add Member</button>
    {/if}
</section>