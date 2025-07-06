<script lang="ts">
    import Dialog from "$lib/components/dialog/Dialog.svelte";
    import {UŊMakeRequest} from '$lib/js/uŋ.svelte';

    interface Props {
        handle_status: (status: number) => void
    }

    let { handle_status }: Props = $props()
    let the_dialog: Dialog
    let id: string = $state('')
    function Open() {
        return the_dialog.open().and(async () => {
            const res = await UŊMakeRequest(`admin/member/${id}`, 'PUT')
            id = ''
            handle_status(res.status)
        })
    }
</script>

<Dialog bind:this={the_dialog} title='Add a UŊ member'>
    {#snippet controls()}
        <button onclick={() => the_dialog.resolve()}>OK</button>
        <button onclick={() => the_dialog.reject()}>Cancel</button>
    {/snippet}

    {#snippet content()}
        <label>
            Discord Id:
            <input type='text' bind:value={id} class='w-max p-1'>
        </label>
    {/snippet}
</Dialog>

<button onclick={Open}>Add Member</button>