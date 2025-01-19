<script lang="ts">
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();
</script>

<style lang="scss">
.wrapper {
    z-index: 1;

    position: fixed;
    top: 4rem;
    right: 0;
    left: 0;

    .content {
        width: 50%;

        margin: 0 auto;
        height: 2rem;
        line-height: 2rem;

        font-size: var(--text-size);
        text-align: center;
        color: white;

        .name {
            color: var(--accentlighter);
            font-weight: bold;
        }

        a {
            font-style: normal;
            color: var(--accentlighter);
        }
    }
}

// If the screen is large enough, use a hack with borders to create sharp corners.
@media (min-width: 500px) {
    .content {
        border-top: 2rem solid var(--accentblack);
        border-right: 2.5rem solid transparent;
        border-left: 2.5rem solid transparent;
        div { transform: translateY(-2rem); }
    }
}

// On tiny screens, just render a box.
@media (max-width: 500px) {
    .content div { background: var(--accentblack); }
}
</style>

<div class="wrapper">
    <div class="content">
        <div>
            {@render children?.()}
        </div>
    </div>
</div>
