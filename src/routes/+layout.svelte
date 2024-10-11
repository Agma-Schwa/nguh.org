<script lang="ts">
    import Header from '$lib/components/Header.svelte';
    import Banner from "$lib/components/Banner.svelte";
    import '$lib/css/style.scss';
    import '$lib/css/banner.scss';
    import {afterUpdate, onDestroy, onMount} from "svelte";

    import { page_title } from "$lib/page_title";
    import {afterNavigate} from "$app/navigation";
    import type {LayoutData} from "./$types";

    let image_preview: ImagePreview
    let image_preview_container: HTMLElement

    interface ImagePreview extends HTMLElement {
        cloned_preview?: Node
    }

    export let data: LayoutData

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

    $: h1_underline_length = function () {
        let len = Math.floor($page_title?.length * 1.5)
        return isFinite(len) ? len : 2
    } ()

    $: h1_underline_length_short = function() {
        let len = Math.floor(($page_title?.length * 1.5) / 1.75)
        return isFinite(len) ? len : 2
    } ()

    onMount(() => {
        // @ts-ignore
        window.SetOpenImagePreview = SetOpenImagePreview
    })

    afterUpdate(() => {
        image_preview.onclick = CloseImagePreview
        SetOpenImagePreview()
    })
</script>

<svelte:head>
    <title>{$page_title === 'Agma Schwa' ? $page_title : $page_title + ' | Agma Schwa'}</title>
    <meta property="og:title" content="{$page_title}">
</svelte:head>

<div id="image-preview" bind:this={image_preview}>
    <div id="image-preview-container" bind:this={image_preview_container}>
    </div>
</div>

<Header langs={data.language_pages} />
<Banner />
<h1>{$page_title === 'Agma Schwa' ? 'WELCOME!' : $page_title}</h1>
<hr id="h1-underline" style="--h1-underline-length: {h1_underline_length}rem; --h1-underline-length-short: {h1_underline_length_short}rem;">

<div id="content-wrapper">
    <main id="content">
        <slot />
        <footer>
            <hr id="footer-rule">
            For more information, see the YouTube channel
            <a href="https://www.youtube.com/@AgmaSchwa"><strong>Agma&nbsp;Schwa</strong></a>
        </footer>
    </main>
</div>
