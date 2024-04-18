## Running the server
```bash
npm install
npm run dev -- --open
```

## Creating a page.
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