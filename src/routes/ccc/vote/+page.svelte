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
        ); else if (e.result.type === 'error') __dialog.error_raw(e.result.error)
    }
</script>

<style lang="scss">
    #submit-form {
        width: min(100%, 40rem);
        display: flex;
        align-items: center;

        input[type=submit] {
            margin-top: 1rem;
            font-size: var(--text-size);
            height: 2rem;
            line-height: 2rem;
            width: min(100%, 10rem);
        }

        label {
            width: 100%;
            height: 2.5rem;
            line-height: 2.5rem;
            display: flex;
            gap: 1rem;
            select { flex-grow: 1; }
        }
    }
</style>

{#if $page.data.session}
<Page name="CCC Voting Form"/>
<Stripe>Cursed Conlang Circus</Stripe>
<section>
    {#if $page.data.enabled}
    <p>
    This is the official Cursed Conlang Circus voting form. As a reminder, the voting process works as follows:
    below, there is a form where you can select your top 6 languages. Top 1 is your favourite language, top
    2 your second favourite and so on. If you don’t have 6 favourite languages, set any remaining slots to
    <code>&lt;none&gt;</code>, which is the first option (e.g. if you only want to vote for 3 languages,
    select <code>&lt;none&gt;</code> for top 4–6).
    </p>

    <p>
    You cannot select the same language multiple times, and you can only vote once. However, you can
    revisit this page at any time and submit another set of votes, which will override your previous
    votes.
    </p>

    <p>
    If you have questions, please contact Ætérnal on the Agma Schwa Discord server.
    </p>

    <form method="POST" id="submit-form" use:enhance={() => ShowDialog}>
        {#each [1, 2, 3, 4, 5, 6] as entry}
            <label>
                Top {entry}:
                <select name="top{entry}">
                    <option value="<none>">&lt;none&gt;</option>
                    {#each $page.data.langs.sort() as lang}
                        {#if $page.data.vote && $page.data.vote[`top${entry}`] === lang}
                            <option value="{lang}" selected>{lang}</option>
                        {:else}
                            <option value="{lang}">{lang}</option>
                        {/if}
                    {/each}
                </select>
            </label>
        {/each}
        <input value="Vote" type="submit">
    </form>
    {:else}
    <p>
    Sorry, the CCC voting form is currently not enabled. Please wait for the
    announcement video that details the voting process.
    </p>
    {/if}
</section>
{/if}