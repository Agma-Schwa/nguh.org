<script lang="ts">
    import Header from '#lib/components/Header.svelte';
    import Banner from "#lib/components/Banner.svelte";
    import '#lib/css/style.css';
    import '#lib/css/tailwind.css';
    import {onMount} from "svelte";

    import { page_title } from "#lib/page_title.js";
    import type {LayoutData} from "./$types";
    import {
        __global_confirm_dialog__,
        __global_error_dialog__,
        ClampXOffs,
        ClampYOffs
    } from '#lib/js/dialog.svelte.js';
    import Ribbon from '#lib/components/Ribbon.svelte';
    import {page} from '$app/state';
    import ErrorDialogInstance from '#lib/components/dialog/ErrorDialogInstance.svelte';
    import ConfirmDialogInstance from '#lib/components/dialog/ConfirmDialogInstance.svelte';

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
        fixed inset-0 z-9998
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

<ErrorDialogInstance bind:this={__global_error_dialog__.__instance__}/>
<ConfirmDialogInstance bind:this={__global_confirm_dialog__.__instance__}/>
<Header langs={data.language_pages} />
<Banner />
{#if page.data.user}
    <Ribbon>
        <span class='shrink-0'>Logged in as</span>
        <span class='min-w-0 truncate font-bold text-(--accentlighter)' title={page.data.user.name}>{page.data.user.name}</span>
        <span class='shrink-0' aria-hidden='true'>•</span>
        <a href='/login' class='shrink-0 text-(--accentmedium)!'>Sign out</a>
    </Ribbon>
{/if}
<div class='absolute top-(--header-height) flex h-[calc(var(--banner-height)-var(--header-height)-var(--header-offset))]
    w-full flex-col items-center justify-center [.page-hide-banner_&]:hidden!'>
    <div class='mx-auto text-[clamp(1.5rem,6vw,3rem)] sm:text-[3rem] md:text-[4rem]'>
        <h1
            class='
                p-0 block wrap-anywhere [text-shadow:-3px_3px_rgb(0_0_0/.8)]
                font-black text-center
                text-white
                px-4
                md:text-nowrap
                uppercase
            '
        >
            {$page_title === 'Agma Schwa' ? 'Welcome!' : $page_title}
        </h1>
        <hr
            class='mx-auto -mt-[.1875em] w-3/4 [border:var(--h1-underline-height)_solid_var(--accentlight)]'
        >
    </div>
</div>

<div
    class='flex min-w-0 pt-(--content-top-offs)'
>   <main class='relative mx-auto my-0 flex w-full min-w-0 max-w-[90rem] flex-col bg-(--body-background-colour) [box-shadow:var(--main-shadow)]'
    >
        {@render children?.()}
        <footer
            class='justify-end text-center pb-2 mt-4 max-md:px-4'
        >
            <hr
                class='m-auto mb-2 w-4/5 border-2 border-(--accentcolour)'
            >
            For more information, see the YouTube channel
            <a href="https://www.youtube.com/@AgmaSchwa"><strong>Agma&nbsp;Schwa</strong></a>
        </footer>
    </main>
</div>
