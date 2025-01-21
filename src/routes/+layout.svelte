<script lang="ts">
    import Header from '$lib/components/Header.svelte';
    import Banner from "$lib/components/Banner.svelte";
    import '$lib/css/style.scss';
    import {onDestroy, onMount} from "svelte";

    import { page_title } from "$lib/page_title";
    import {afterNavigate} from "$app/navigation";
    import type {LayoutData} from "./$types";
    import {ClampXOffs, ClampYOffs} from "$lib/js/dialog";

    let image_preview: ImagePreview
    let image_preview_container: HTMLElement

    interface ImagePreview extends HTMLElement {
        cloned_preview?: Node
    }

    interface Props {
        data: LayoutData;
        children?: import('svelte').Snippet;
    }

    let { data, children }: Props = $props();

    function OpenImagePreview() {
        let instance = this
        if (window.getComputedStyle(this).getPropertyValue('opacity') === '0') {
            for (let node of this.parentNode.children) {
                if (node.tagName === 'IMG' && window.getComputedStyle(node).getPropertyValue('opacity') !== '0') {
                    instance = node
                    break
                }
            }
            if (instance === this) return
        }

        image_preview.style.display = 'flex'
        image_preview.cloned_preview = instance.cloneNode(false)
        image_preview.cloned_preview["style"].margin = '0'
        image_preview.cloned_preview["style"].padding = '0'
        image_preview.cloned_preview["style"].maxWidth = image_preview.cloned_preview["style"].maxHeight = '100%'
        image_preview.cloned_preview["style"].height = image_preview.cloned_preview["style"].width = 'auto'
        image_preview.cloned_preview["style"].objectFit = 'contain'
        image_preview.cloned_preview["style"].zIndex = '9999'

        image_preview_container.appendChild(image_preview.cloned_preview)
    }

    function CloseImagePreview() {
        image_preview.style.display = 'none'
        while (image_preview_container.children.length)
            image_preview_container.removeChild(image_preview_container.children[0])
    }

    function SetOpenImagePreview() {
        for (let img of document.getElementsByTagName('img'))
            if (!img.classList.toString().includes('non-previewable-icon'))
                img.addEventListener('click', OpenImagePreview)
    }

    let inner_width: number = $state(0)
    let inner_height: number = $state(0)
    let scroll_x: number = $state(0)
    let scroll_y: number = $state(0)
    let old_inner_width: number
    let old_inner_height: number
    let old_scroll_x: number
    let old_scroll_y: number

    onMount(() => {
        // @ts-ignore
        window.SetOpenImagePreview = SetOpenImagePreview
        old_inner_width = inner_width
        old_inner_height = inner_height
        old_scroll_x = scroll_x
        old_scroll_y = scroll_y
    })

    $effect(() => {
        image_preview.onclick = CloseImagePreview
        SetOpenImagePreview()
    })

    function ClampX(d: HTMLDialogElement) {
        d.style.left = ClampXOffs(d.offsetLeft, d, inner_width) + 'px'
    }

    function ClampY(d: HTMLDialogElement) {
        d.style.top = ClampYOffs(d.offsetTop, d, inner_height) + 'px'
    }

    function OnResize() {
        for (const d of document.querySelectorAll('dialog')) {
            if (inner_width < old_inner_width) ClampX(d)
            if (inner_height < old_inner_height) ClampY(d)
        }

        old_inner_width = inner_width
        old_inner_height = inner_height
    }

    function OnScroll() {
        for (const d of document.querySelectorAll('dialog')) {
            if (scroll_x != old_scroll_x) ClampX(d)
            if (scroll_y != old_scroll_y) ClampY(d)
        }

        old_scroll_x = scroll_x
        old_scroll_y = scroll_y
    }
</script>

<svelte:window
    bind:innerWidth={inner_width}
    bind:innerHeight={inner_height}
    bind:scrollX={scroll_x}
    bind:scrollY={scroll_y}
    onresize={OnResize}
    onscroll={OnScroll}
/>

<svelte:head>
    <title>{$page_title === 'Agma Schwa' ? $page_title : $page_title + ' | Agma Schwa'}</title>
    <meta property="og:title" content="{$page_title}">
</svelte:head>

<div
    bind:this={image_preview}
    class="
        fixed inset-0 [z-index:9998]
        w-full h-full
        hidden items-center justify-center
        backdrop-brightness-50
">
    <div
        bind:this={image_preview_container}
        class="
            absolute inset-4 md:inset-20
            flex items-center justify-center
    ">
    </div>
</div>

<Header langs={data.language_pages} />
<Banner />
<div id='h1-wrapper' class='absolute w-full flex flex-col items-center justify-center'>
    <div class='mx-auto'>
        <h1
            style='text-shadow: -3px 3px rgba(0, 0, 0, .8);'
            class='
                p-0 block
                font-black text-center
                text-white
                sm:text-[3rem]
                md:text-[4rem]
                md:text-nowrap
                uppercase
            '
        >
            {$page_title === 'Agma Schwa' ? 'Welcome!' : $page_title}
        </h1>
        <hr
            style='border: var(--h1-underline-height) solid var(--accentlight);'
            class='m-auto -mt-3 w-3/4'
        >
    </div>
</div>

<div
    class='flex gap-4'
    style='
        padding-top: var(--content-padding-top);
        min-height: calc(100vh - var(--banner-height) - var(--content-padding-top))
'>  <main
        style='
            box-shadow: 0 0 2em var(--content-box-shadow-colour);
            max-width: min(90rem, 100vw);
            width: 90rem;
        '
        class='
            relative my-0 mx-auto pb-16
            flex flex-col
        '
    >
        {@render children?.()}
        <footer
            class='absolute inset-x-4 bottom-4 text-center'
        >
            <hr
                style='border: 2px solid var(--accentcolour);'
                class='w-4/5 m-auto mb-2'
            >
            For more information, see the YouTube channel
            <a href="https://www.youtube.com/@AgmaSchwa"><strong>Agma&nbsp;Schwa</strong></a>
        </footer>
    </main>
</div>

<style>
    #h1-wrapper {
        top: var(--header-height);
        height: calc(var(--banner-height) - var(--header-height)  - var(--header-offset));
    }

    @media (max-width: 900px) {
        :root {
            --h1-underline-height: .35rem;
            --header-offset: 2.5rem;
        }
    }

    @media (max-width: 650px) {
        :root {
            --h1-underline-height: .2rem;
            --header-offset: 1.5rem;
        }
    }
</style>
