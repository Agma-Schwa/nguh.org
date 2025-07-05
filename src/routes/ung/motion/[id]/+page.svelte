<script lang='ts' module>
    import markdownit from 'markdown-it'
    const md = markdownit()
</script>

<script lang='ts'>
    import Page from '$lib/components/Page.svelte';
    import Stripe from '$lib/components/Stripe.svelte';
    import Member from '$lib/components/ung/Member.svelte';
    import EditMotion from '$lib/components/ung/EditMotion.svelte';
    import {page} from '$app/state';
    import {EnableAdminMode, LockMotion, UŊMakeRequest} from '$lib/js/uŋ.svelte';
    import Dialog from '$lib/components/dialog/Dialog.svelte';
    import ErrorDialog from '$lib/components/dialog/ErrorDialog.svelte';
    import {invalidateAll} from '$app/navigation';

    let { data } = $props();
    let dialog: Dialog
    let error: ErrorDialog
    let edit_mode = $state(false)
    let admin = $derived(page.data.admin && EnableAdminMode())

    function BeforeUnload(e: BeforeUnloadEvent) {
        if (edit_mode) e.preventDefault();
    }

    function Vote() {
        dialog.open().and(async (vote: boolean) => {
            const res = await UŊMakeRequest(`motion/${data.motion.id}/vote/${vote ? 1 : 0}`, 'PATCH')
            switch (res.status) {
                default: error.open(`Unexpected Error (${res.status})`); break;
                case 404: error.open('Invalid Motion'); break;
                case 403: error.open('Please wait until the motion is locked and on the agenda for an ongoing meeting'); break;
                case 204: await invalidateAll(); break;
            }
        })
    }
</script>

<svelte:window onbeforeunload={BeforeUnload} />

<Page name='UŊ'></Page>
<Stripe>Motion #{data.motion.id}</Stripe>

<ErrorDialog bind:this={error} />
<Dialog bind:this={dialog} title='Vote'>
    {#snippet controls()}
        <button onclick={() => dialog.resolve(true)}>Aye</button>
        <button onclick={() => dialog.resolve(false)}>No</button>
        <button onclick={() => dialog.reject()}>Cancel</button>
    {/snippet}
    {#snippet content()}
        Vote in favour of this motion?
    {/snippet}
</Dialog>

<section>
    {#if edit_mode}
        <EditMotion
            on_done={() => edit_mode = false}
            type={data.motion.type}
            title={data.motion.title}
            text={data.motion.text}
        />
        <div class='flex'>
            <button class='m-auto'  onclick={() => document.location.reload()}>Cancel</button>
        </div>
    {:else}
        <h2 class='mb-8'>
            {data.motion.title}
            [<span style='font-variant: small-caps'>{data.motion.type}</span>]
            {#if data.motion.locked}
                <span>🔒</span>
            {/if}
        </h2>
        <div class='mb-8'>
            <div class='m-auto w-fit'>
                <Member member={data.author} />
            </div>
        </div>
        <div class='flex'>
            {#if data.motion.closed}
                <span class='italic m-auto'>Voted on During Meeting #{data.motion.meeting}</span>
            {:else if data.motion.meeting}
                <span class='italic m-auto'>Scheduled for Meeting #{data.motion.meeting}</span>
            {/if}
        </div>
        {#if data.votes.length !== 0}
            {@const ayes = data.votes.filter(v => v.vote).length}
            <h3 class='text-left'>Votes</h3>
            <p>Ayes: {ayes}, Noes: {data.votes.length - ayes}, Quorum: TODO</p>
            <div class='grid gap-4 leading-8 mb-8' style='grid-template-columns: auto 1fr'>
                {#each data.votes as vote}
                    <div><Member member={vote.member}/></div>
                    <div>{vote.vote ? '✅' : '❌'}</div>
                {/each}
            </div>
        {/if}
        <div id='ung-motion-text'>
            {@html md.render(data.motion.text)}
        </div>
        <div class='flex mt-8 justify-center gap-10'>
            {#if data.active && data.motion.meeting === data.active && !data.motion.closed && data.motion.locked}
                <button onclick={Vote}>Vote</button>
            {/if}
            {#if (data.motion.author === page.data.user.id && !data.motion.locked) || admin}
                <button onclick={() => edit_mode = true}>Edit Motion</button>
            {/if}
            {#if admin}
                <button onclick={() => LockMotion(data.motion.id, !data.motion.locked)}>
                    {data.motion.locked ? 'Unlock Motion' : 'Lock Motion'}
                </button>
            {/if}
        </div>
    {/if}
</section>
