<script lang="ts">
    interface Props {
        active: boolean,
        align?: 'left' | 'right',
        scroll_y?: boolean
        children: import('svelte').Snippet
    }

    let {active, align = 'left', scroll_y = false, children}: Props = $props()
</script>

{#if active}
    <!--
        This is a hack to allow for y-scrolling on this element only; we add
        a background below the actual header and position it above the scroll
        area so that it hides anything we scroll up and ‘under’ the header.
    -->
    {#if scroll_y}
        <div id='background' class='absolute top-0 left-0 w-full'></div>
    {/if}

    <div id='wrapper' class='absolute flex flex-col {scroll_y ? "topmost" : ""} {align === "right" ? "right-0" : "" }'>
        {@render children()}
    </div>
{/if}

<style lang='scss'>
    #background {
        z-index: -1;
        background: var(--nav-bg);
        height: var(--header-height);
    }

    #wrapper {
        z-index: -2;
        background: var(--nav-bg);
        top: 0;
        padding-top: var(--header-height);
        min-width: var(--nav-link-min-wd);

        :global(a span) { text-align: left; }
        :global(a) {
            height: 2rem;
            line-height: 2rem;
            @media (min-width: 900px) { padding-inline: 1.25rem; }
        }
    }

    .topmost {
        height: 100vh;
        overflow-y: scroll;
    }
</style>