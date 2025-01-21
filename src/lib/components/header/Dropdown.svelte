<script lang="ts">
    import PageLink from '$lib/components/header/PageLink.svelte';
    import Items from '$lib/components/header/Items.svelte';
    import type {MediaQuery} from 'svelte/reactivity';

    interface Props {
        href?: string
        name: string
        align?: 'left' | 'right'
        mobile: MediaQuery
        children: import('svelte').Snippet
    }

    let {href, name, align = 'left', mobile, children}: Props = $props()
    let hovered = $state(false)
</script>

<div onmouseenter={() => hovered = true} onmouseleave={() => hovered = false}>
    <!-- If the name is a link render it; if not, only render it if we’re not in mobile mode. -->
    {#if href}
        <PageLink {href} category={true}>{name}</PageLink>
    {:else if !mobile.current}
        <div class='name header-bg-transition'>
            <span>{name}</span>
        </div>
    {/if}

    <!-- Render the content. -->
    {#if mobile.current}
        <div id='wrapper'>
            {@render children()}
        </div>
    {:else if hovered}
        <Items active={hovered} {align} {children} />
    {/if}
</div>

<style lang='scss'>
    .name {
        min-width: var(--nav-link-min-wd);
        color: var(--nav-fg);
        height: var(--header-height);
        line-height: var(--header-height);
        text-align: center;
    }

    @media (max-width: 900px) {
        #wrapper :global(a) {
            --nav-a-padding-left: 2rem;
        }
    }
</style>
