## Running the server
```bash
npm install
npm run dev -- --open
```

## Hunger Games Simulator
If you came here looking for the Hunger Games Simulator, it’s here:
- [/src/routes/tools/hunger_games_simulator/+page.svelte](/src/routes/tools/hunger_games_simulator/+page.svelte), and
- [/src/lib/js/hunger_games_simulator.ts](src/lib/js/hunger_games_simulator.ts)

## Creating a page
To create the page `/foo/bar/baz`, create the directories
in the `src/routes` directory, in this case, create `/src/routes/foo/bar/baz`, and then create a `+page.svelte`
file in that directory, containing
```sveltehtml
<script>
  import Page from '$lib/components/Page.svelte';
</script>

<Page name="Page Name Goes Here" />

<!-- Page Content Goes Here -->
``` 