<script lang='ts'>
    import Page from '$lib/components/Page.svelte';
    import Stripe from '$lib/components/Stripe.svelte';
    import Member from '$lib/components/ung/Member.svelte';
    import EditMotion from '$lib/components/ung/EditMotion.svelte';
    import {page} from '$app/state';
    import {
        EnableAdminMode,
        EnableMotion,
        GetEmoji,
        LockMotion, MarkdownInstance,
        UŊMakeRequest,
        UŊMakeRequestAndCheckErr
    } from '$lib/js/uŋ.svelte';
    import Dialog from '$lib/components/dialog/Dialog.svelte';
    import {goto, invalidateAll} from '$app/navigation';
    import type {CreateMotion, MemberProfile, Motion, Vote} from '$lib/js/ung_types';
    import {Err, Prompt} from '$lib/js/dialog.svelte';
    import NationCard from '$lib/components/ung/NationCard.svelte';

    let { data } = $props();
    let dialog: Dialog
    let edit_mode = $state(false)
    let me: MemberProfile | null = $derived(page.data.me)
    let motion: Motion = $derived(data.motion)
    let admin = $derived(page.data.admin && EnableAdminMode())
    let owner_can_edit = $derived(!motion.locked && motion.author === page.data.user.id)
    let votes: Vote[] = $derived(data.votes)
    let voted: boolean = $derived(Boolean(votes.find(v => v.nation.id === me?.represented_nation)))

    function BeforeUnload(e: BeforeUnloadEvent) {
        if (edit_mode) e.preventDefault();
    }

    function Vote() {
        dialog.open().and(async (vote: boolean) => {
            const res = await UŊMakeRequest(`motion/${motion.id}/vote/${vote ? 1 : 0}`, 'PUT')
            switch (res.status) {
                default: Err(`Unexpected Error (${res.status})`); break;
                case 409: Err('You have already voted on this motion.'); break;
                case 404: Err('Invalid Motion'); break;
                case 403: Err('Please wait until the motion is locked and put on the agenda for an ongoing meeting.'); break;
                case 204: await invalidateAll(); break;
            }
        })
    }

    function CloseAsRejected() {
        Prompt('Forcefully close this motion? This will cause it to be rejected!').and(async () => {
            await UŊMakeRequestAndCheckErr(`admin/motion/${motion.id}/close`, 'POST')
        })
    }

    function Reset() {
        Prompt('Completely reset this motion’s state and votes? THIS CANNOT BE UNDONE!').and(async () => {
            await UŊMakeRequestAndCheckErr(`admin/motion/${motion.id}/reset`, 'POST')
        })
    }

    function LockMotionUser() {
        Prompt('Are you sure you want to lock this motion? You won‘t be able to edit it anymore.').and(async () => {
            await UŊMakeRequestAndCheckErr(`motion/${motion.id}/lock`, 'PUT')
        })
    }

    function DeleteMotion() {
        Prompt('Are you sure you want to DELETE this motion? THIS CANNOT BE UNDONE!').and(async () => {
            const res = await UŊMakeRequest(`motion/${motion.id}`, 'DELETE')
            if (res.ok) await goto('/ung/motions', { replaceState: true, invalidateAll: true })
            else Err(`Error ${res.ok}`);
        })
    }

    async function Edit(data: CreateMotion) {
        const res = await UŊMakeRequest(`motion/${motion.id}`, 'PATCH', data)
        edit_mode = false
        switch (res.status) {
            default: Err(`Error ${res.status}: ${await res.text()}`); break;
            case 413: Err('The motion text or title is too long!'); break;
            case 204: await invalidateAll(); break;
        }
    }

    function FormatMotionType(): string | undefined {
        switch (motion.type) {
            case "Legislative": return '[legal]'
            case "Executive": return '[exec]'
            case "Constitutional": return '[const]'
        }
    }
</script>

<svelte:window onbeforeunload={BeforeUnload} />

<Page name='UŊ'></Page>
<Stripe>Motion #{motion.id}</Stripe>

<!--
    Note: There is no way to remove in-absentia votes per motion. This is because
    so long as at least one in-absentia vote for any one nation remains across all
    motions that are part of a meeting, that nation is counted as part of the meeting,
    which raises the quorum, and as a result, a missing vote by that nation is equal
    to a rejection. I.e. to 'remove' a vote, simply change it to 'reject' instead.

    Only if 'all' in-absentia votes by a nation are removed is that nation removed
    from the meeting; there is a button for that on the meeting page since this is
    also required if a nation wishes to rescind their in-absentia votes and attend
    in person instead.
-->
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

<section>
    {#if edit_mode}
        <EditMotion
            on_submit={Edit}
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
            <span style='font-variant: small-caps'>{FormatMotionType()}</span>
            <span>{GetEmoji(motion)}</span>
        </h2>
        <div class='mb-8'>
            <div class='m-auto w-fit'>
                <Member member={data.author} />
            </div>
        </div>
        <div class='flex mb-8'>
            {#if votes.length !== 0 && !motion.enabled}
                <span class='italic m-auto'>Voted on During Meeting #{motion.meeting}</span>
            {:else if motion.meeting}
                <span class='italic m-auto'>Scheduled for Meeting #{motion.meeting}</span>
            {/if}
        </div>
        {#if votes.length !== 0 || motion.enabled || motion.closed}
            {@const ayes = votes.filter(v => v.vote).length}
            <h3 class='text-left'>Votes</h3>
            <div class=' mb-8'>
                <p>Ayes: {ayes}, Noes: {votes.length - ayes}{#if !data.absentia || motion.closed}, Quorum: {motion.quorum}{/if}</p>
                <div class='grid gap-4 leading-8 items-center' style='grid-template-columns: auto 1fr'>
                    {#each votes as vote}
                        <div><NationCard nation={vote.nation} member={vote.member}/></div>
                        <div>{vote.vote ? '✅' : '❌'}</div>
                    {/each}
                </div>

                {#if motion.closed}
                    {#if motion.passed}
                            {#if motion.type !== 'Constitutional'}
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
            {@html MarkdownInstance.render(motion.text)}
        </div>
        <div class='flex mt-8 justify-center gap-10'>
            {#if
                me?.represented_nation &&
                data.active &&
                motion.meeting === data.active &&
                motion.locked &&
                (   // Allow amending votes in-absentia, but not during a meeting.
                    page.data.absentia ||
                    (motion.enabled && !voted)
                )
            }
                <button onclick={Vote}>Vote {page.data.absentia ? 'in Absentia' : ''}</button>
            {/if}
            {#if owner_can_edit || admin}
                <button onclick={() => edit_mode = true}>Edit</button>
            {/if}
            {#if admin}
                <button onclick={() => LockMotion(motion.id, !motion.locked)}>
                    {motion.locked ? 'Unlock' : 'Lock'}
                </button>
                {#if data.active && motion.meeting === data.active}
                    <button
                        onclick={() => EnableMotion(motion.id, !motion.enabled)}
                        disabled={page.data.absentia}
                        title={page.data.absentia ? 'Must disable in-absentia voting first!' : ''}
                    >
                        {motion.enabled ? 'Disable Voting' : 'Enable Voting'}
                    </button>
                {/if}
                {#if votes.length !== 0 || motion.closed}
                    <button onclick={Reset} class='bg-rose-800 text-white'>
                        Reset
                    </button>
                {/if}
                {#if !motion.closed}
                    <button onclick={CloseAsRejected} class='bg-rose-800 text-white'>
                        Close as Rejected
                    </button>
                {/if}
            {:else if owner_can_edit}
                <button onclick={LockMotionUser}>
                    Lock
                </button>
            {/if}
            {#if !motion.locked && (admin || owner_can_edit)}
                <button onclick={DeleteMotion} class='bg-rose-800 text-white'>
                    Delete
                </button>
            {/if}
        </div>
    {/if}
</section>
