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
        <div class='absolute top-0 left-0 -z-1 h-(--header-height) w-full bg-(--nav-bg)'></div>
    {/if}

    <div class='items-wrapper absolute top-0 -z-2 flex min-w-(--nav-link-min-wd) flex-col
                bg-(--nav-bg) pt-(--header-height) [&_a_span]:text-left!
                {scroll_y
                    ? "h-dvh w-full overflow-y-auto overscroll-contain [&_a]:h-auto! [&_a]:min-h-9 [&_a]:py-1 [&_a]:leading-tight! [&_a]:whitespace-normal"
                    : "[&_a]:h-8! [&_a]:leading-8! [&_a]:px-5!"}
                {align === "right" ? "right-0" : ""}'>
        {@render children()}
    </div>
{/if}
