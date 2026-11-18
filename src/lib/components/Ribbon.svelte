<script lang="ts">
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();
</script>


<div class="pointer-events-none fixed inset-x-0 top-(--header-height) z-50">
    <div class="pointer-events-auto mx-auto flex h-8 w-full items-center justify-center gap-2 bg-(--accentblack) px-2
        text-(length:--text-size) whitespace-nowrap text-white
        min-[500px]:w-fit min-[500px]:min-w-1/2 min-[500px]:max-w-full min-[500px]:px-12
        min-[500px]:[clip-path:polygon(0_0,100%_0,calc(100%-2.5rem)_100%,2.5rem_100%)]">
        {@render children?.()}
    </div>
</div>
