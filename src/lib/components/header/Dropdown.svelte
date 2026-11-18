<script lang="ts">
    import PageLink from '#lib/components/header/PageLink.svelte';
    import Items from '#lib/components/header/Items.svelte';
    import type {MediaQuery} from 'svelte/reactivity';

    interface Props {
        href?: string
        name: string
        align?: 'left' | 'right'
        mobile: MediaQuery
        children: import('svelte').Snippet
    }

    let {href, name, align = 'left', mobile, children}: Props = $props()
</script>

<div class='dropdown'>
    <!-- If the name is a link render it; if not, only render it if we’re not in mobile mode. -->
    {#if href}
        <PageLink {href} category={true}>{name}</PageLink>
    {:else if !mobile.current}
        <button type='button' class='name header-bg-transition'>{name}</button>
    {/if}

    <!-- Render the content. -->
    {#if mobile.current}
        <div class='mobile-items'>
            {@render children()}
        </div>
    {:else}
        <div class='dropdown-items'>
            <Items active={true} {align} {children} />
        </div>
    {/if}
</div>

<style lang='scss'>
    .dropdown-items { display: none; }

    .dropdown:hover > .dropdown-items,
    .dropdown:focus-within > .dropdown-items { display: block; }

    .name {
        &:not(:hover) { background: transparent; }
        &:hover { background: white; }
        min-width: var(--nav-link-min-wd);
        color: var(--nav-fg);
        height: var(--header-height);
        line-height: var(--header-height);
        text-align: center;
    }

    @media (max-width: 900px) {
        .mobile-items :global(a) {
            --nav-a-padding-left: 2rem;
        }
    }
</style>
