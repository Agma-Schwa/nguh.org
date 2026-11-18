<script lang="ts">
    import type {MediaQuery} from 'svelte/reactivity';
    import Items from '#lib/components/header/Items.svelte';

    interface Props {
        mobile: MediaQuery,
        children: import('svelte').Snippet
    }

    let {mobile, children}: Props = $props()
    let toggled = $state(false)
    function Toggle(e: Event) {
        e.stopPropagation()
        toggled = !toggled
    }
</script>

<svelte:window onclick={() => toggled = false} onkeydown={event => {
    if (event.key === 'Escape') toggled = false
}} />

{#if mobile.current}
    <button
        type='button'
        aria-label='Navigation menu'
        aria-expanded={toggled}
        aria-controls='items'
        id='hamburger'
        class='grid place-items-center h-(--header-height) px-4 bg-transparent! hover:bg-white! transition-[background-color,color] duration-500 cursor-pointer'
        onclick={Toggle}
    >   <svg width="1.5em" height="1.2em" xmlns="http://www.w3.org/2000/svg" class='pointer-events-none fill-(--accentmedium)'>
            <rect width="1.5em" height=".2em"/>
            <rect width="1.5em" height=".2em" y=".5em"/>
            <rect width="1.5em" height=".2em" y="1em"/>
        </svg>
    </button>
    <div id='items' class='absolute top-0 left-0 w-full'>
        <Items active={toggled} {children} scroll_y={true} />
    </div>
{:else}
    <div class='hidden justify-end lg:flex'>
        {@render children()}
    </div>
{/if}
