<script lang="ts">
    import border from "#lib/images/border.svg";
    interface Props {
        children?: import('svelte').Snippet;
        tight?: boolean;
    }

    let { children, tight = false }: Props = $props();
</script>

<h2
    class={[`relative flex min-h-40 items-center justify-center bg-(--accentlight) text-(--accentdarker)!
        before:absolute before:inset-x-0 before:top-0 before:h-6 before:[background-image:var(--stripe-border)] before:bg-size-[auto_1.5rem]
        after:absolute after:inset-x-0 after:bottom-0 after:h-6 after:[background-image:var(--stripe-border)] after:bg-size-[auto_1.5rem]
        first-of-type:mt-0 [@media(max-width:900px)]:min-h-28`,
        tight ? 'my-6' : 'my-12']}
    style:--stripe-border={`url("${border}")`}
>
    <span>
        {@render children?.()}
    </span>
</h2>