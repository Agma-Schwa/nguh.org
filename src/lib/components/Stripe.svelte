<script lang="ts">
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();
</script>

<h2 class="stripe">
    <span>
        {@render children?.()}
    </span>
</h2>