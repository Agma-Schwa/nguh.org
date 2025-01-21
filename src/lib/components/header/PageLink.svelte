<script lang="ts">
    interface Props {
        href: string
        image?: string
        children: import('svelte').Snippet
    }

    let {href, image, children}: Props = $props()
</script>

<a {href} class='flex items-center header-bg-transition text-nowrap pr-2'>
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
</style>