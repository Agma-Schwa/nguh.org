<script lang="ts">
    interface Props {
        children?: import('svelte').Snippet;
        tight?: boolean;
    }

    let { children, tight = false }: Props = $props();
</script>

<h2 class={`stripe ${tight ? 'tight' : ''}`}>
    <span>
        {@render children?.()}
    </span>
</h2>