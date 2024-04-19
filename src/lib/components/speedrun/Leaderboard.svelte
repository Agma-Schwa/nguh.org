<script lang="ts">
    export let image: string;
    export let name: string;
    export let scores: [string, string][];
</script>

<style lang="scss">
    .leaderboard {
        max-width: min(100%, 500px);

        .speedrun-category-image {
            width: 100%;
        }
    }
</style>

<div class="leaderboard">
    <h4>{name}</h4>
    <img src="{image}" alt="{name}" class="speedrun-category-image">
    {#if scores.length}
        <table>
            <colgroup>
                <col>
                <col>
                <col>
            </colgroup>
            <tbody>
                {#each scores as [name, time], position}
                    <tr>
                        <td>{position + 1}.</td>
                        <td>{name}</td>
                        <td class="speedrun-time-col">{time}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {/if}
</div>