<script>
    import {onMount} from "svelte";

    export let name;
    export let theme = 'light'

    import {page_title} from "$lib/page_title";
    import {page_theme} from "$lib/page_theme";

	$page_title = name;
	$page_theme = theme;

	onMount(() => {
	    /// Make all images previewable. On the first page load, the
	    /// layout component will do that for us.
	    if ('SetOpenImagePreview' in window) {
            // @ts-ignore
            window.SetOpenImagePreview()
	    }

	    /// Set theme.
        if (theme === 'light') document.body.classList.remove('dark')
        else document.body.classList.add('dark')
	})
</script>
