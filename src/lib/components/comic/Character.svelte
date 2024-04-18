<script lang="ts">
    export let name: string;
    export let info: object;
    export let image: string
    export let rule_after: boolean = true;
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
         <slot />
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