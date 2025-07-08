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

    // Put rulers first, then administrators, then other members by name. We sort these
    // here since there may be multiple code paths and queries retrieving members on the
    // server (and that way less work is happening on the server which is also nice).
    let members_sorted = $derived(members.toSorted((m1, m2) => {
        // @ts-ignore
        if (m1.ruler !== m2.ruler) return +m2.ruler - +m1.ruler
        if (m1.administrator !== m2.administrator) return +m2.administrator - +m1.administrator
        return m1.display_name.localeCompare(m2.display_name)
    }))
</script>

<div class='flex flex-col gap-2'>
    {#each members_sorted as member}
        {@const removable = can_be_removed(member)}
        <div class='flex gap-1'>
            {#if editable}
                <XButton enabled={removable} onclick={() => do_remove(member)} />
            {/if}
            <Member {member} />
        </div>
    {/each}
</div>