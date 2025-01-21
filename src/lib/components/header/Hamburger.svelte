<script lang="ts">
    import type {MediaQuery} from 'svelte/reactivity';
    import Items from '$lib/components/header/Items.svelte';

    interface Props {
        mobile: MediaQuery,
        children: import('svelte').Snippet
    }

    let {mobile, children}: Props = $props()
    let toggled = $state(false)
    let hovered = $state(false)
    function Toggle(e: Event) {
        e.stopPropagation()
        toggled = !toggled
    }
</script>

<svelte:window onclick={() => toggled = false} />

{#if mobile.current}
    <div
        id='hamburger'
        class='grid place-items-center px-4 header-bg-transition cursor-pointer'
        onclick={Toggle}
        onmouseenter={() => hovered = true}
        onmouseleave={() => hovered = false}
    >   <svg width="1.5em" height="1.2em" xmlns="http://www.w3.org/2000/svg" class='pointer-events-none'>
            <rect width="1.5em" height=".2em"/>
            <rect width="1.5em" height=".2em" y=".5em"/>
            <rect width="1.5em" height=".2em" y="1em"/>
        </svg>
    </div>
    <div id='items' class='absolute top-0 left-0 w-full'>
        <Items active={toggled || hovered} {children} scroll_y={true} />
    </div>
{:else}
    <div class='flex justify-end'>
        {@render children()}
    </div>
{/if}

<style lang='scss'>
    svg { fill: var(--accentmedium); }
    #hamburger { height: var(--header-height); }
</style>