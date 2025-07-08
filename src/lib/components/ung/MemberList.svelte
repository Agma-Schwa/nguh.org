<script lang='ts' module>
    import type {MemberProfile} from '$lib/js/ung_types';
</script>

<script lang='ts' generics='Profile extends MemberProfile'>
    import Member from '$lib/components/ung/Member.svelte';
    import XButton from '$lib/components/ung/XButton.svelte';

    interface Props {
        members: Profile[],
        editable: boolean,
        can_be_removed(m: Profile): boolean
        do_remove(m: Profile): void
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