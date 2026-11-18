<script lang="ts">
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();
</script>


<div class="fixed inset-x-0 top-16 z-1">
    <div class="mx-auto h-8 w-1/2 text-center text-(length:--text-size) leading-8 text-white min-[500px]:border-x-[2.5rem] min-[500px]:border-t-[2rem] min-[500px]:border-transparent min-[500px]:border-t-(--accentblack)">
        <div class="min-[500px]:-translate-y-8 [@media(max-width:500px)]:bg-(--accentblack)">
            {@render children?.()}
        </div>
    </div>
</div>
