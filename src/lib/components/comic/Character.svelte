<script lang="ts">
    interface Props {
        name: string;
        info: object;
        image: string;
        rule_after?: boolean;
        children?: import('svelte').Snippet;
    }

    let {
        name,
        info,
        image,
        rule_after = true,
        children
    }: Props = $props();
</script>

<div class="character">
    <img src={image} alt="Character Image">
    <div class="character-content">
        <h3 class="name">{name}</h3>
        <p class="info">
            {#each Object.entries(info) as [key, value], i}
                {#if i !== 0} <br> {/if}
                {key}: {value}
            {/each}
        </p>
         {@render children?.()}
    </div>
</div>

{#if rule_after}
    <hr class="character-rule">
{/if}

<style lang="scss">
    .character {
        display: flex;
        flex-direction: row;

        img { width: 15rem !important; }

        .character-content {
            width: 100%;
            padding-left: 2rem;

            h3 {
                width: 100%;
                text-align: center;
            }
            .info { color: var(--accentcolour); }
        }
    }

    .character-rule {
        margin-block: 1rem;
        border-color: var(--accentcolour);
    }
</style>