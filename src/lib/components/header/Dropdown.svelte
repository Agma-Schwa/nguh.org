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

<div class='group/dropdown dropdown'>
    <!-- If the name is a link render it; if not, only render it if we’re not in mobile mode. -->
    {#if href}
        <PageLink {href} category={true}>{name}</PageLink>
    {:else if !mobile.current}
        <button type='button' class='h-(--header-height) min-w-(--nav-link-min-wd) bg-transparent! text-center leading-(--header-height) text-(--nav-fg)! hover:bg-white! transition-[background-color,color] duration-500'>{name}</button>
    {/if}

    <!-- Render the content. -->
    {#if mobile.current}
        <div class='[&_a]:[--nav-a-padding-left:2rem]'>
            {@render children()}
        </div>
    {:else}
        <div class='dropdown-items hidden group-hover/dropdown:block group-focus-within/dropdown:block'>
            <Items active={true} {align} {children} />
        </div>
    {/if}
</div>
