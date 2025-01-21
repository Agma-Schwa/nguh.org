<script lang="ts">
    import {afterNavigate} from '$app/navigation';
    import {onMount} from 'svelte';

    interface Props {
        href: string
        image?: string
        category?: boolean
        children: import('svelte').Snippet
    }

    let {href, image, category = false, children}: Props = $props()
    let active = $state(false)
    onMount(RecomputeActive)
    afterNavigate(RecomputeActive)
    function RecomputeActive() {
        let path = (window.location.pathname || '/')
        active = category ? path.startsWith(href) : path === href
    }
</script>

<a {href} class='flex items-center header-bg-transition text-nowrap pr-2 {active ? "active" : ""}'>
    {#if image}
        <img alt='Page Image' src={image} class='non-previewable-icon mr-2 h-12'>
    {/if}
    <span class='text-center w-full'>
        {@render children()}
    </span>
</a>

<style lang='scss'>
    a {
        height: var(--header-height);
        line-height: var(--header-height);
        font-size: var(--text-size);
        min-width: var(--nav-link-min-wd);
        padding-left: var(--nav-a-padding-left);
        &, &:visited, &:hover:visited { color: var(--nav-fg); }
    }

    .active { background: white; }
</style>