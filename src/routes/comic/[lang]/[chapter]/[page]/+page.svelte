<script lang="ts">
    import Page from "#lib/components/Page.svelte";
    import NavButtons from "#lib/components/comic/NavButtons.svelte";
    import Backdrop from "#lib/components/Backdrop.svelte";
    import { style } from 'svelte-body';

    let { data } = $props();
</script>

<svelte:body use:style={'--body-background-colour: transparent !important; --main-shadow: none !important;'} />

<svelte:head>
    {#if data.page !== 0}
        <link rel="preload" as="image" href='/static/comic/{data.chapter}/{data.page - 1}-{data.lang}.png'>
    {/if}
    <link rel="preload" as="image" href='/static/comic/{data.chapter}/{data.page}-{data.lang === "en" ? "ar" : "en"}.png'>
    {#if data.page !== data.pages[data.chapter - 1]}
        <link rel="preload" as="image" href='/static/comic/{data.chapter}/{data.page + 1}-{data.lang}.png'>
    {/if}
</svelte:head>

{#if data.lang === 'en'}
<Page name='Dog Days' />
{:else}
<Page name='Djogawa Djororx' />
{/if}

<Backdrop
    image="/static/comic/{data.chapter}/{data.page}-en.png"
    transparent={true}
/>

<div class="fixed top-[50vh] right-18 [@media(max-width:1850px)]:right-4
           [@media(max-width:1630px)]:static [@media(max-width:1630px)]:mb-4
           [@media(max-width:1630px)]:flex [@media(max-width:1630px)]:justify-center">
    <a
        data-sveltekit-noscroll
        class="link-button px-2 [@media(max-width:1630px)]:w-20!"
        href="/comic/{data.lang === 'en' ? 'ar' : 'en'}/{data.chapter}/{data.page}"
    ><span>EN</span>&nbsp;⟳&nbsp;<span>AR</span></a>
</div>

<NavButtons {data} />
<img src='/static/comic/{data.chapter}/{data.page}-{data.lang}.png' alt="Comic Page" class="non-previewable-icon w-full cursor-default">
<NavButtons {data} />
