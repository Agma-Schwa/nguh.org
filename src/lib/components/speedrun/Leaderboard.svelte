<script lang="ts">
    interface Props {
        image: string;
        name: string;
        scores: [string, string][];
    }

    let { image, name, scores }: Props = $props();
</script>


<div class="w-3/4 min-w-0 max-w-[375px] [@media(width>900px)]:w-[37.5%]">
    <h3>{name}</h3>
    <img src={image} alt="{name}" class="h-auto w-full">
    {#if scores.length}
        <table class="w-full [&_td]:text-(length:--text-size)!">
            <tbody>
                {#each scores as [name, time], position}
                    <tr>
                        <td class="w-px whitespace-nowrap">{position + 1}.</td>
                        <td class="wrap-anywhere">{name}</td>
                        <td class="w-px text-right font-bold whitespace-nowrap">{time}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {/if}
</div>
