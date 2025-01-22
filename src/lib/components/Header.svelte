<script lang="ts">
    import agma_logo from '$lib/images/agma_logo.png';
    import type {LanguagePage} from "$lib/js/types";
    import PageLink from '$lib/components/header/PageLink.svelte';
    import Hamburger from '$lib/components/header/Hamburger.svelte';
    import {MediaQuery} from 'svelte/reactivity';
    import Dropdown from '$lib/components/header/Dropdown.svelte';

    interface Props {
        langs: LanguagePage[];
    }

    let { langs }: Props = $props();
    const mobile = new MediaQuery('max-width: 900px');
    const laptop = new MediaQuery('(max-width: 1250px) and (min-width: 900px)');
</script>

{#snippet Tools()}
    <PageLink href='/tools/hunger_games_simulator'>Hunger Games Simulator</PageLink>
    <PageLink href='/tools/word_generator'>Word Generator</PageLink>
    <PageLink href='/tools/speedrun'>Speedrun</PageLink>
    <PageLink href='/ccc/vote'>CCC Voting Form</PageLink>
{/snippet}

{#snippet Extra()}
    <PageLink href='/gambian_holiday'>Gambian Holiday Wiki</PageLink>
    <PageLink href='/support-us'>Support Us</PageLink>
{/snippet}

<header class='fixed top-0 w-full [z-index:10000] flex select-none {mobile.current ? "" : "justify-between"}'>
    <PageLink image={agma_logo} href='/'>AGMA SCHWA</PageLink>
    <nav>
        <Hamburger {mobile}>
            <PageLink href='/the-channel'>The Channel</PageLink>
            <Dropdown href='/languages' name='Languages' {mobile}>
                {#each langs as lang}
                    <PageLink href="/languages/{lang.page}">{lang.name}</PageLink>
                {/each}
            </Dropdown>
            <PageLink href='/comic'>Comic</PageLink>
            <PageLink href='/merch'>Merch</PageLink>
            {#if laptop.current}
                <Dropdown name='Other' {mobile} align='right'>
                    <PageLink href='/tools'>Tools</PageLink>
                    {@render Tools()}
                    {@render Extra()}
                </Dropdown>
            {:else}
                <Dropdown href='/tools' name='Tools' {mobile} children={Tools} />
                {@render Extra()}
            {/if}
        </Hamburger>
    </nav>
</header>

<style lang='scss'>
    header {
        --nav-fg: var(--accentmedium);
        --nav-bg: var(--accentblack);
        --nav-link-min-wd: 8.5rem;
        --nav-a-padding-left: .5rem;
        height: var(--header-height);
        background: var(--nav-bg);
    }

    :global(.header-bg-transition) {
        transition: background .5s, color .5s;
        &:hover { background: white; }
    }

    @media (max-width: 900px) {
        nav {
            --nav-link-min-wd: 100%;
        }
    }
</style>
