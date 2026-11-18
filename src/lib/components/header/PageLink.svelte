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

<a {href} class='flex h-(--header-height) min-w-(--nav-link-min-wd) items-center
          pr-2 pl-(--nav-a-padding-left) text-(length:--text-size) leading-(--header-height)
          text-nowrap text-(--nav-fg)! transition-[background-color,color] duration-500 hover:bg-white {active ? "bg-white" : ""}'>
    {#if image}
        <img alt='' src={image} class='non-previewable-icon mr-2 h-12'>
    {/if}
    <span class='text-center w-full'>
        {@render children()}
    </span>
</a>
