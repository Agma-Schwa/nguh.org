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
    import {EnableAdminMode, EnableMotion, LockMotion, TYPE_CONST, UŊMakeRequest} from '$lib/js/uŋ.svelte';
    import Dialog from '$lib/components/dialog/Dialog.svelte';
    import ErrorDialog from '$lib/components/dialog/ErrorDialog.svelte';
    import {invalidateAll} from '$app/navigation';
    import type {Motion} from '$lib/js/ung_types';

    let { data } = $props();
    let dialog: Dialog
    let error: ErrorDialog
    let edit_mode = $state(false)
    let admin = $derived(page.data.admin && EnableAdminMode())
    let motion: Motion = $derived(data.motion)

    function BeforeUnload(e: BeforeUnloadEvent) {
        if (edit_mode) e.preventDefault();
    }

    function Vote() {
        dialog.open().and(async (vote: boolean) => {
            const res = await UŊMakeRequest(`motion/${motion.id}/vote/${vote ? 1 : 0}`, 'PUT')
            switch (res.status) {
                default: error.open(`Unexpected Error (${res.status})`); break;
                case 409: error.open('You have already voted on this motion.'); break;
                case 404: error.open('Invalid Motion'); break;
                case 403: error.open('Please wait until the motion is locked and put on the agenda for an ongoing meeting.'); break;
                case 204: await invalidateAll(); break;
            }
        })
    }
</script>

<svelte:window onbeforeunload={BeforeUnload} />

<Page name='UŊ'></Page>
<Stripe>Motion #{motion.id}</Stripe>

<ErrorDialog bind:this={error} />
<Dialog bind:this={dialog} title='Vote'>
    {#snippet controls()}
        <button onclick={() => dialog.resolve(true)} class='bg-green-800 text-white'>Aye</button>
        <button onclick={() => dialog.reject()}>Cancel</button>
        <button onclick={() => dialog.resolve(false)} class='bg-rose-800 text-white'>No</button>
    {/snippet}
    {#snippet content()}
        <p>Vote in support of this motion?</p>
        {#if !page.data.absentia}
            <p>Choose carefully as you won’t be able to change your vote<br>once it has been submitted.</p>
        {:else}
            <p>You’re voting in absentia; this means you can change your<br>vote at any time <em>before the next meeting</em>.</p>
        {/if}
    {/snippet}
</Dialog>

<!--
    TODO:
    On the backend, set 'closed' to true via a database trigged as soon as the
    number of ayes or noes exceeds half of the quorum (or 3/5 or 2/5 in the case
    of a constitutional motion).

    When a motion is closed, display 'PASSED' or 'REJECTED' on the frontend (compute
    this dynamically from the votes+quorum; we don't actually need to store this state).

    Do not allow *changing* votes once a motion is closed (do allow people to *add* votes
    if they haven’t voted yet though since that won't change anything and so people don't
    get annoying errors as soon as we exceed the threshold).

    Support manually closing/opening a motion (only for admins of course) to close motions
    if there is no consensus or in case we want to allow someone to change their vote.
-->

<section>
    {#if edit_mode}
        <EditMotion
            on_done={() => edit_mode = false}
            type={motion.type}
            title={motion.title}
            text={motion.text}
        />
        <div class='flex'>
            <button class='m-auto'  onclick={() => document.location.reload()}>Cancel</button>
        </div>
    {:else}
        <h2 class='mb-8'>
            {motion.title}
            [<span style='font-variant: small-caps'>{motion.type}</span>]
            {#if motion.locked}
                <span>🔒</span>
            {/if}
        </h2>
        <div class='mb-8'>
            <div class='m-auto w-fit'>
                <Member member={data.author} />
            </div>
        </div>
        <div class='flex mb-8'>
            {#if data.votes.length !== 0 && !motion.enabled}
                <span class='italic m-auto'>Voted on During Meeting #{motion.meeting}</span>
            {:else if motion.meeting}
                <span class='italic m-auto'>Scheduled for Meeting #{motion.meeting}</span>
            {/if}
        </div>
        {#if data.votes.length !== 0 || motion.enabled}
            {@const ayes = data.votes.filter(v => v.vote).length}
            <h3 class='text-left'>Votes</h3>
            <div class=' mb-8'>
                <p>Ayes: {ayes}, Noes: {data.votes.length - ayes}, Quorum: {motion.quorum}</p>
                <div class='grid gap-4 leading-8' style='grid-template-columns: auto 1fr'>
                    {#each data.votes as vote}
                        <div><Member member={vote.member}/></div>
                        <div>{vote.vote ? '✅' : '❌'}</div>
                    {/each}
                </div>

                <!-- FIXME: Constitutional motions in here should be treated like other motions; constitutional support should be done elsewhere. -->
                {#if motion.closed}
                    {#if ayes * 2 > motion.quorum}
                            {#if motion.type !== TYPE_CONST}
                                <p class='mt-4 text-green-600'><strong>PASSED</strong></p>
                            {:else if motion.supported}
                                <p class='mt-4 text-green-600'><strong>SUPPORTED</strong></p>
                            {:else}
                                <p class='mt-4 text-yellow-500'><strong>PASSED ON CONDITION OF SUPPORT</strong></p>
                            {/if}
                    {:else}
                        <p class='mt-4 text-rose-600'><strong>REJECTED</strong></p>
                    {/if}
                {/if}
            </div>
        {/if}
        <div id='ung-motion-text'>
            {@html md.render(motion.text)}
        </div>
        <div class='flex mt-8 justify-center gap-10'>
            {#if
                data.active &&
                motion.meeting === data.active &&
                motion.locked &&
                (   // Allow amending votes in-absentia, but not during a meeting.
                    page.data.absentia ||
                    (motion.enabled && !data.votes.find(v => v.member.discord_id === page.data.user.id))
                )
            }
                <button onclick={Vote}>Vote {page.data.absentia ? 'in Absentia' : ''}</button>
            {/if}
            {#if (motion.author === page.data.user.id && !motion.locked) || admin}
                <button onclick={() => edit_mode = true}>Edit Motion</button>
            {/if}
            {#if admin}
                <button onclick={() => LockMotion(motion.id, !motion.locked)}>
                    {motion.locked ? 'Unlock Motion' : 'Lock Motion'}
                </button>
                <button
                    onclick={() => EnableMotion(motion.id, !motion.enabled)}
                    disabled={page.data.absentia}
                    title={page.data.absentia ? 'Must disable in-absentia voting first!' : ''}
                >
                    {motion.enabled ? 'Disable Voting' : 'Enable Voting'}
                </button>
            {/if}
        </div>
    {/if}
</section>
