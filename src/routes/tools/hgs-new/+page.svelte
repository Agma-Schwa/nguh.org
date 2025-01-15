<script lang="ts">
    import '$lib/css/hunger_games_simulator.scss'
    import Page from "$lib/components/Page.svelte";
    import Stripe from "$lib/components/Stripe.svelte";
    import Ribbon from "$lib/components/Ribbon.svelte";
    import SingleFileDialog from "$lib/components/dialog/SingleFileDialog.svelte";
    import CharacterSelectScreen from "$lib/components/hgs/CharacterSelectScreen.svelte";
    import {
        Game,
        PronounSetting,
        Tag,
        type TributeCharacterSelectOptions,
        type TributeOptions,
        type TributePronouns
    } from "$lib/js/hgs";

    // TODO: Use web storage API to store uploaded files for tribute images.

    /** Create a new game. */
    function StartGame() {
        game = new Game()
    }

    // The current game state.
    let game: Game | null = $state(null)

    // Remaining state for an ongoing game; this is all grouped together
    // to ensure that games don’t influence each other. The only reason the
    // game state is separate is because there is also a ‘game state’ for
    // rendering the character selection UI.

    // Tributes that are currently in the character selector.
    let tributes: TributeCharacterSelectOptions[] = $state([
        {
            name: "Player 1",
            pronoun_option: PronounSetting.Masculine,
        },
        {
            name: "Player 2",
            pronoun_option: PronounSetting.Feminine,
        },
        {
            name: "Player 3",
            pronoun_option: PronounSetting.Custom,
        },
    ]);
</script>

<Page name="Hunger Games Simulator" theme="dark" />
<Ribbon><em>Last Updated: 28 October 2024</em></Ribbon>

<svelte:head>
    <!-- FIXME: Extract metadata to separate component  -->
    <meta name="keywords" content="hunger games simulator hungergame hungergames hungergamessimulator humger-games simulator hunger-games-simulator">
</svelte:head>

{#if game === null}
    <CharacterSelectScreen {tributes} start_game={StartGame} />
{/if}
