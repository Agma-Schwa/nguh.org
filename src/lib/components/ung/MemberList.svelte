<script lang='ts'>
    import Member from '$lib/components/ung/Member.svelte';
    import type {MemberProfile} from '$lib/js/ung_types';
    import XButton from '$lib/components/ung/XButton.svelte';

    interface Props {
        members: MemberProfile[],
        editable: boolean,
        can_be_removed(m: MemberProfile): boolean
        do_remove(m: MemberProfile): void
    }

    let { members, editable, can_be_removed, do_remove }: Props = $props()
</script>

<div class='flex flex-col gap-2'>
    {#each members as member}
        {@const removable = can_be_removed(member)}
        <div class='flex gap-1'>
            {#if editable}
                <XButton enabled={removable} onclick={() => do_remove(member)} />
            {/if}
            <Member {member} />
        </div>
    {/each}
</div>