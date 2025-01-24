<script lang="ts">
    import {onMount, onDestroy} from "svelte";

    interface Props {
        slides: string[];
    }

    let { slides }: Props = $props();

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

<div class="slideshow" bind:this={slideshow}>
    <div class="slideshow-slides">
        <div class="before" onclick={PreviousSlide} aria-hidden=true>❮</div>
        {#each slides as slide, i}
            {#if i === 0}
                <img class="active" src={slide} alt="Slide {i}">
            {:else}
                <img src={slide} alt="Slide {i}">
            {/if}
        {/each}
        <div class="after" onclick={NextSlide} aria-hidden=true>❯</div>
    </div>
    <div class="slideshow-navbar">
        {#each slides as _, i}
            {#if i === 0}
                <div class="active" onclick={() => JumpToSlide(i)} aria-hidden=true></div>
            {:else}
                <div onclick={() => JumpToSlide(i)} aria-hidden=true></div>
            {/if}
        {/each}
    </div>
</div>

<style lang="scss">
    $slideshow-navbar-height: 2em;

    .slideshow {
        &-slides {
            position: relative;
            display: grid;
            place-items: center;
            grid-template-areas: "inner";

            img {
                opacity: 0;
                width: 100%;
                grid-area: inner;
                transition: opacity 1s;

                &.active { opacity: 1; }
            }

            .before, .after {
                position: absolute;
                top: 0;
                bottom: 0;
                z-index: 1;
                padding: 0 .5em;

                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;

                color: white;
                font-size: 2rem;
                transition: transform .5s;
                cursor: pointer;
                mix-blend-mode: difference;

                &:hover {
                    box-shadow: inset 0 0 0 1000px rgba(0, 0, 0, .2);
                    mix-blend-mode: normal;
                }
            }

            .before { left: 0; }
            .after { right: 0; }
        }

        &-navbar {
            width: 100%;
            height: $slideshow-navbar-height;

            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;

            &:hover { cursor: pointer; }

            div {
                height: .6em;
                width: .6em;

                border-radius: 50%;
                background: lightgrey;
                transition: background .2s;

                &:hover { background: var(--accentcolour); }

                & + div { margin-left: 1em; }
            }

            .active { background: var(--accentcolour); }
        }
    }
</style>
