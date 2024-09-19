<script lang="ts">
    import { page } from "$app/stores";
    import Page from "$lib/components/Page.svelte";
    import Stripe from "$lib/components/Stripe.svelte";
    import { enhance } from '$app/forms';
    import type {ActionResult} from "@sveltejs/kit";
    import {onMount} from "svelte";
    import type {Dialog} from "$lib/js/dialog";

    // Hack so this only runs on the client.
    let __dialog: typeof Dialog;
    onMount(async () => { __dialog = (await import("$lib/js/dialog")).Dialog })

    // Show a success dialog after submitting.
    function ShowDialog(e: {result: ActionResult, update: () => void}) {
        if (e.result.status == 204) __dialog.info(
            "Success",
            "Your votes have been submitted successfully."
        )
    }
</script>

<style lang="scss">
    #submit-form {
        width: max-content;
        display: flex;
        align-items: center;

        input[type=submit] {
            margin-top: 1rem;
            font-size: var(--text-size)
        }
    }
</style>

{#if $page.data.session}
<Page name="CCC Voting Form"/>
<Stripe>Hi, {$page.data.session.user?.name}</Stripe>
<section>
    <p>
        This is the official CCC voting form. As a reminder, the voting process works as follows: below,
        there is a form where you can select your top 6 languages. Top 1 is your favourite language, top
        2 your second favourite and so on.
    </p>

    <p>
        You cannot select the same language multiple times, and you can only vote once. However, you can
        revisit this page at any time and submit another set of votes, which will override your previous
        votes.
    </p>

    <form method="POST" id="submit-form" use:enhance={() => ShowDialog}>
        {#each [1, 2, 3, 4, 5, 6] as entry}
            <label>
                Top {entry}:
                <select name="top{entry}">
                    {#each $page.data.langs.sort() as lang}
                        <option value="{lang}">{lang}</option>
                    {/each}
                </select>
            </label>
        {/each}
        <input value="Vote" type="submit">
    </form>
</section>
{/if}