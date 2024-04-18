<script lang="ts">
    import {afterNavigate} from "$app/navigation";
    import {browser} from "$app/environment";
    import {onDestroy, onMount} from "svelte";

    export let image: string;
    export let transparent = false;

    function SetBackdrop() {
        /// @ts-ignore
        if (browser) {
            document.querySelector('.backdrop').style.background = `url('${image}'`
            if (transparent) {
                const main = document.querySelector('main')
                main.style.background = 'transparent'
                main.style.boxShadow = 'none'
            }
        }
    }

    onMount(SetBackdrop)
    afterNavigate(SetBackdrop)
    onDestroy(() => {
        /// @ts-ignore
        if (browser) {
            document.querySelector('.backdrop').style.removeProperty('background')
            document.querySelector('main').style.removeProperty('background')
            document.querySelector('main').style.removeProperty('box-shadow')
        }
    })
</script>

<div class="backdrop"></div>

<style lang="scss">
    .backdrop {
        z-index: -10000;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        filter: blur(1rem);
    }
</style>