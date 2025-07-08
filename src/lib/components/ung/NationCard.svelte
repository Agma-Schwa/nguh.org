<script lang='ts'>
    import type {MemberProfile} from '$lib/js/ung_types';

    interface NationPartial {
        id?: number,
        name: string,
        banner_url: string | null,
        observer?: boolean,
    }

    interface Props {
        nation: NationPartial;
        member?: MemberProfile;
        links?: boolean;
        starred?: boolean,
    }

    let { nation, member = undefined, links = false, starred = false }: Props = $props()
</script>

{#snippet card()}
<div class='flex gap-2 wrapper'>
    <div class='relative'>
        <img src={nation.banner_url} class='nation-flag non-previewable-icon'>
        {#if member}
            <img src='{member.avatar_url}' class='member-image non-previewable-icon'>
        {/if}
    </div>
    <span id='name' class='leading-10 text-2xl'>
        {nation.name}
        {#if nation.observer} 👁️ {/if}
        {#if starred} ⭐ {/if}
    </span>
</div>
{/snippet}

{#if links && nation.id}
    <a href='/ung/nations/{nation.id}'>{@render card()}</a>
{:else}
    {@render card()}
{/if}

<style lang='scss'>
    #name {
        font-variant: small-caps;
        font-family: Lato, sans-serif;
        color: var(--accentmedium);
    }

    .wrapper {
        --width: 1.25rem;
    }

    .nation-flag {
        user-select: none;
        border-radius: 0 0 var(--width) var(--width);
        width: var(--width);
        height: 2.5rem;
    }

    .member-image {
        user-select: none;
        position: absolute;
        border-radius: 50%;

        // Fiddling w/ magic pixel offsets until this looks ‘good enough’.
        bottom: 2px;
        width: calc(var(--width) - 2.5px);
        left: 1px;
    }
</style>