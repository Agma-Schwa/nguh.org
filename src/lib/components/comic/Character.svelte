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

<div class="flex">
    <img class="w-60!" src={image} alt={name}>
    <div class="w-full pl-8">
        <h3 class="w-full text-center">{name}</h3>
        <p class="text-(--accentcolour)">
            {#each Object.entries(info) as [key, value], i}
                {#if i !== 0} <br> {/if}
                {key}: {value}
            {/each}
        </p>
         {@render children?.()}
    </div>
</div>

{#if rule_after}
    <hr class="my-4 border-(--accentcolour)">
{/if}
