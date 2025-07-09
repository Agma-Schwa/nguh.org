<script lang='ts'>
    import {page} from '$app/state';
    import Member from '$lib/components/ung/Member.svelte';
    import type {Meeting, MemberProfile, MotionNoText, SetMotionMeetingRequestBody} from '$lib/js/ung_types';
    import {EnableAdminMode, GetEmoji, UŊMakeRequest} from '$lib/js/uŋ.svelte';
    import Dialog from '$lib/components/dialog/Dialog.svelte';
    import {invalidateAll} from '$app/navigation';

    interface Props {
        interactive: boolean
        motions: MotionNoText[],
        members: MemberProfile[],
        meetings?: Meeting[],
    }

    let {
        interactive,
        motions,
        members,
        meetings = [],
    }: Props = $props()

    let admin = $derived(page.data.admin && EnableAdminMode())
    let schedule: Dialog
    let selected_meeting: string

    function Schedule(id: number) {
        schedule.open().and(async () => {
            const res = await UŊMakeRequest('admin/motion/meeting', 'PATCH', {
                motion: id,
                meeting: Number(selected_meeting)
            } satisfies SetMotionMeetingRequestBody)

            if (!res.ok) console.log(res.status, await res.text())
            await invalidateAll()
        })
    }
</script>

{#if interactive}
    {#snippet controls()}
        <button onclick={() => schedule.resolve()}>Ok</button>
        <button onclick={() => schedule.reject()}>Cancel</button>
    {/snippet}

    {#snippet content()}
        <select bind:value={selected_meeting}>
            {#each meetings as meeting}
                <option value={meeting.id}>#{meeting.id} – {meeting.name}</option>
                <option value='0'>Clear</option>
            {/each}
        </select>
    {/snippet}

    <Dialog
        bind:this={schedule}
        title='Schedule Meeting'
        {controls}
        {content}
    />
{/if}

<div id='motion-grid'>
    {#each motions as motion}
        <div><Member member='{members.find(m => m.discord_id === motion.author)}' /></div>
        <a href='/ung/motion/{motion.id}' class='overflow-x-hidden'>
            <span class='{motion.closed ? "line-through text-gray-500" : ""}'>
                {motion.title}
                [<span style='font-variant: small-caps'>{motion.type}</span>]
            </span>
            <span>{GetEmoji(motion)}</span>
        </a>
        {#if interactive}
            <div class='flex flex-row justify-end gap-2'>
                {#if motion.closed}
                    Voted on during meeting #{motion.meeting}
                {:else}
                    {#if motion.meeting}
                        Scheduled for meeting #{motion.meeting}
                    {:else}
                        Not scheduled
                    {/if}
                    {#if admin}
                        <button onclick={() => Schedule(motion.id)}>Schedule</button>
                    {/if}
                {/if}
            </div>
        {:else}
            <div></div>
        {/if}
    {/each}
</div>

<style class='scss'>
    #motion-grid {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 1rem;
        line-height: 2rem;
        button { width: 7rem; }
    }
</style>