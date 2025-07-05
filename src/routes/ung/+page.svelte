<script lang="ts">
    import {page} from "$app/state";
    import Page from '$lib/components/Page.svelte';
    import Stripe from '$lib/components/Stripe.svelte';
    import ErrorDialog from '$lib/components/dialog/ErrorDialog.svelte';
    import AddMemberForm from '$lib/components/ung/AddMemberForm.svelte';
    import {invalidateAll} from '$app/navigation';
    import type {BotService} from '$lib/js/discord';
    import ConfirmDialog from '$lib/components/dialog/ConfirmDialog.svelte';

    let error: ErrorDialog
    let confirm: ConfirmDialog
    let members: BotService.UŊMemberList = $derived(page.data.members)

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

    async function DeleteMember(id: string, name: string) {
        confirm.open(`Are you sure you want to remove ${name}?`).on_success(async () => {
            const res = await fetch(`/ung/api/member?id=${id}`, { method: 'DELETE' });
            switch (res.status) {
                case 500: error.open('Internal Server Error'); break;
                case 403: error.open('Admins cannot be deleted'); break;
                case 404: error.open('The specified member is not a UŊ member'); break;
                case 204: invalidateAll(); break;
                default: throw Error("Unreachable")
            }
        })
    }
</script>

<!-- FIXME: Refactor this jank so we don't have 10000 error dialgog component instances.  -->
<ErrorDialog bind:this={error} />
<ConfirmDialog bind:this={confirm}/>

<Page name="UŊ"/>
<Stripe>UŊ Hub</Stripe>
<section>
    {#if page.data.admin}
        <AddMemberForm handle_status={AddMemberHandleStatus} />
    {/if}
    <h2>Members</h2>
    <table class='table-no-style'>
        <tbody>
            <!-- DO NOT assign 'page.data.members' to a variable, else the invalidateAll() calls will do nothing... -->
            {#each members as member}
                <tr>
                    {#if page.data.admin}
                        <td class='pr-2'>
                            <button
                                class='w-8 p-1 !bg-transparent { member.admin ? "grayscale" : "hover:invert transition-[filter]" }'
                                onclick={() => DeleteMember(member.id, member.display_name) }
                                disabled={member.admin}>
                                ❌
                            </button>
                        </td>
                    {/if}
                    <td><img src='{member.avatar_url}' class='w-8 rounded-full non-previewable-icon select-none'></td>
                    <td class='pl-2'>
                        {member.display_name}
                        {#if member.admin}
                            <span class='select-none'>🛡️</span>
                        {/if}
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</section>

<style lang='scss'>
    .delete-button:not(:hover) {
       // background: none !important;
    }

</style>