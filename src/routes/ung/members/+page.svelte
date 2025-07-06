<script lang="ts">
    import Stripe from '$lib/components/Stripe.svelte';
    import {page} from '$app/state';
    import AddMemberForm from '$lib/components/ung/AddMemberForm.svelte';
    import ErrorDialog from '$lib/components/dialog/ErrorDialog.svelte';
    import ConfirmDialog from '$lib/components/dialog/ConfirmDialog.svelte';
    import {invalidateAll} from '$app/navigation';
    import Page from '$lib/components/Page.svelte';
    import {EnableAdminMode, UŊMakeRequest} from '$lib/js/uŋ.svelte';
    import type {MemberProfile} from '$lib/js/ung_types';
    import MemberList from '$lib/components/ung/MemberList.svelte';

    let error: ErrorDialog
    let confirm: ConfirmDialog
    let members: MemberProfile[] = $derived(page.data.members)
    let admin = $derived(page.data.admin && EnableAdminMode())

    function AddMemberHandleStatus(status: number) {
        switch (status) {
            case 500: error.open('Internal Server Error'); break;
            case 409: error.open(`This member is already registered as a UŊ member.`); break;
            case 404: error.open(`The specified id does not refer to a server member.`); break;
            case 400: error.open(`Invalid discord id.`); break;
            case 201: invalidateAll(); break;
            default: throw Error("Unreachable")
        }
    }

    async function DeleteMember(m: MemberProfile) {
        confirm.open(`Are you sure you want to remove ${m.display_name}?`).and(async () => {
            const res = await UŊMakeRequest(`admin/member/${m.discord_id}`, 'DELETE');
            switch (res.status) {
                case 500: error.open('Cannot delete this member. There are probably foreign keys referencing them.'); break;
                case 403: error.open('Admins cannot be deleted'); break;
                case 404: error.open('The specified member is not a UŊ member'); break;
                case 204: await invalidateAll(); break;
                default: throw Error("Unreachable")
            }
        })
    }
</script>

<Page name='UŊ' />

<!-- FIXME: Refactor this jank so we don't have 10000 error dialog component instances.  -->
<ErrorDialog bind:this={error} />
<ConfirmDialog bind:this={confirm}/>

<Stripe>Members</Stripe>
<section>
    {#if admin}
        <div class='mb-5'>
            <AddMemberForm handle_status={AddMemberHandleStatus} />
        </div>
    {/if}
        <MemberList
            {members}
            editable={admin}
            can_be_removed={m => !m.administrator}
            do_remove={DeleteMember}
        />
</section>