<script lang='ts'>
    import type {MemberProfile} from '$lib/js/ung_types';

    interface Props {
        member: MemberProfile
    }

    let { member } = $props()
</script>

<div class='flex gap-2'>
    <div><img src='{member.avatar_url}' class='w-8 rounded-full non-previewable-icon select-none'></div>
    <div class='leading-8'>
        {member.display_name}
        {#if member.administrator}
            <span class='select-none'>🛡️</span>
        {/if}
    </div>
</div>