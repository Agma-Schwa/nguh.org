<script lang="ts">
    import Page from "$lib/components/Page.svelte";
    import NavButtons from "$lib/components/comic/NavButtons.svelte";
    import Backdrop from "$lib/components/Backdrop.svelte";
    import { style } from 'svelte-body';

    export let data;
</script>

<svelte:body use:style={'background-color: var(--body-background-colour);'} />

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

<div class="switch-languages-button">
    <a
        data-sveltekit-noscroll
        class="link-button switch-languages"
        href="/comic/{data.lang === 'en' ? 'ar' : 'en'}/{data.chapter}/{data.page}"
    ><span>EN</span>&nbsp;⟳&nbsp;<span>AR</span></a>
</div>

<NavButtons {data} />
<img src='/static/comic/{data.chapter}/{data.page}-{data.lang}.png' alt="Comic Page" class="non-previewable-icon page">
<NavButtons {data} />

<style lang="scss">
    .switch-languages-button {
        position: fixed;
        right: 4.5rem;
        top: 50vh;
        a { padding-inline: .5rem; }
    }

    .page {
        cursor: default;
    }

    @media only screen and (max-width: 1850px) {
        .switch-languages-button {
            right: 1rem;
        }
    }

    @media only screen and (max-width: 1630px) {
        .switch-languages-button {
            position: unset;
            display: flex;
            flex-direction: row;
            justify-content: center;
            margin-bottom: 1rem;

            a {
                width: 5rem;
            }
        }
    }
</style>