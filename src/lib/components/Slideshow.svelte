<script lang="ts">
    import {onMount, onDestroy} from "svelte";

    interface Props {
        slides: string[];
        class?: string;
    }

    let { slides, class: className }: Props = $props();

    const arrowClass = 'absolute inset-y-0 z-1 flex cursor-pointer select-none items-center justify-center px-[.5em] text-[2rem] text-white mix-blend-difference transition-transform duration-500 hover:mix-blend-normal hover:shadow-[inset_0_0_0_1000px_rgb(0_0_0/.2)]'

    let slideshow: HTMLDivElement
    let active: number
    let timestamp_last_switched: number
    let update_interval_handle = undefined

    function UnsetActiveSlide() {
        let slides = slideshow.getElementsByTagName('img')
        let buttons = slideshow.getElementsByClassName('slideshow-navbar')[0].children

        timestamp_last_switched = new Date().getTime()

        for (let el of [slides, buttons])
            if (el)
                el[active].classList.remove('active')

        return {slides, buttons};
    }

    function SetActiveSlide(slides: HTMLCollectionOf<HTMLImageElement>, buttons: HTMLCollection, slide: number) {
        for (let el of [slides, buttons]) el[slide].classList.add('active')
    }

    function AdvanceSlideshow(increment: number) {
        let {slides, buttons} = UnsetActiveSlide()

        if (!active && increment === -1) active = slides.length - 1
        else active = (active + increment) % slides.length

        SetActiveSlide(slides, buttons, active)
    }

    function JumpToSlide(slide: number) {
        let {slides, buttons} = UnsetActiveSlide()
        active = slide
        SetActiveSlide(slides, buttons, slide)
    }

    function PreviousSlide() {
        AdvanceSlideshow(-1)
    }

    function NextSlide() {
        AdvanceSlideshow(1)
    }

    function Mount() {
        /// Get slides and mark the first one as active.
        let slides = slideshow.getElementsByTagName('img')
        if (slides?.length < 2) return
        active = 0
        slides[0].classList.add('active')

        // @ts-ignore
        window.JumpToSlide = JumpToSlide

        timestamp_last_switched = new Date().getTime()

        /// Switch slides every 5 seconds.
        update_interval_handle = window.setInterval(() => {
            if (new Date().getTime() - timestamp_last_switched > 4500)
                AdvanceSlideshow(1)
        }, 5000)
    }

    function Unmount() {
        if (update_interval_handle) window.clearInterval(update_interval_handle)
    }

    onMount(Mount)
    onDestroy(Unmount)
</script>

<div class={["slideshow", className]} bind:this={slideshow}>
    <div class="relative grid place-items-center [grid-template-areas:'inner'] [&>img]:w-full [&>img]:opacity-0 [&>img]:[grid-area:inner] [&>img]:transition-opacity [&>img]:duration-1000 [&>img.active]:opacity-100">
        <div class="left-0 {arrowClass}" onclick={PreviousSlide} aria-hidden=true>❮</div>
        {#each slides as slide, i}
            {#if i === 0}
                <img class="active" src={slide} alt="Slide {i}">
            {:else}
                <img src={slide} alt="Slide {i}">
            {/if}
        {/each}
        <div class="right-0 {arrowClass}" onclick={NextSlide} aria-hidden=true>❯</div>
    </div>
    <div class="slideshow-navbar flex h-[2em] w-full items-center justify-center gap-[1em] hover:cursor-pointer
               [&>div]:size-[.6em] [&>div]:rounded-full [&>div]:bg-[lightgrey] [&>div]:transition-colors
               [&>div]:duration-200 [&>div.active]:bg-(--accentcolour) [&>div:hover]:bg-(--accentcolour)">
        {#each slides as _, i}
            {#if i === 0}
                <div class="active" onclick={() => JumpToSlide(i)} aria-hidden=true></div>
            {:else}
                <div onclick={() => JumpToSlide(i)} aria-hidden=true></div>
            {/if}
        {/each}
    </div>
</div>
