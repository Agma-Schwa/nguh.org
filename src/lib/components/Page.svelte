<script lang="ts">
    import {onMount} from "svelte";


    import {page_title} from "$lib/page_title";
    import {page_theme} from "$lib/page_theme";
    interface Props {
        name: any;
        banner?: boolean,
        theme?: string;
    }

    let { name, theme = 'light', banner = true }: Props = $props();

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

    // If requested, hide the banner, and adjust the content top offset accordingly.
    function HideBanner() {
        if (!banner) {
            document.body.classList.add('page-hide-banner')
            document.body.style.setProperty('--content-top-offs', 'var(--header-height)')
            return () => {
                document.body.classList.remove('page-hide-banner')
                document.body.style.setProperty('--content-top-offs', 'var(--content-padding-top)')
            }
        }
    }

</script>

<svelte:body {@attach HideBanner} />
