<script lang="ts">
    import img_youtube from '#lib/images/youtube.png'
    import img_patreon from '#lib/images/patreon-creators-patreon.png'
    import img_discord from '#lib/images/discord-logo-with-background.svg'
    import img_twitter from '#lib/images/twitter.svg'
    import img_instagram from '#lib/images/instagram.png'
    import img_facebook from '#lib/images/facebook.png'
    import img_reddit from '#lib/images/reddit.png'
    import img_twitch from '#lib/images/twitch-logo-with-background.svg'
    import img_github from '#lib/images/github-mark.svg'

    import spring from '#lib/images/banner_spring.png';
    import summer from '#lib/images/banner_summer.jpg';
    import autumn from '#lib/images/banner_autumn.jpg';
    import winter from '#lib/images/banner_winter.jpg';

    const backgrounds = {spring, summer, autumn, winter};

    // Compute the current season.
    function GetSeason() {
        let month = new Date().getMonth()
        switch (month) {
            // November, December, January, February
            case 10:
            case 11:
            case 0:
            case 1:
                return 'winter'

            // March, April, May
            case 2:
            case 3:
            case 4:
                return 'spring'

            // June, July, August
            case 5:
            case 6:
            case 7:
                return 'summer'

            // September, October
            case 8:
            case 9:
                return 'autumn'
        }

        // Should never be reached.
        return 'spring'
    }
</script>

<div
    id="banner"
    class='relative isolate h-(--banner-height) bg-cover bg-no-repeat
        shadow-[inset_0_0_0_1000px_rgb(0_0_0/.25),0_2px_1rem_black]
        [.page-hide-banner_&]:hidden!'
    style:background-image={`url("${backgrounds[GetSeason()]}")`}
>   <div
        class='
            absolute
            z-9999
            bottom-0
            min-[900px]:right-0
            max-[900px]:justify-center max-[900px]:w-full
            pb-4 pr-4
            flex flex-wrap [&_img]:ml-4 [&_img]:h-8 [@media(max-width:900px)]:[&_img]:h-6
        '
    >   <a href="https://www.youtube.com/@AgmaSchwa">
            <img src="{img_youtube}" alt="youtube" class="non-previewable-icon">
        </a>
        <a href="https://www.patreon.com/nguh">
            <img src="{img_patreon}" alt="patreon" class="non-previewable-icon">
        </a>
        <a href="https://discord.gg/zCA2Urv7Tc">
            <img src="{img_discord}" alt="discord" class="non-previewable-icon">
        </a>
        <a href="https://twitter.com/AgmaSchwa">
            <img src="{img_twitter}" alt="twitter" class="non-previewable-icon">
        </a>
        <a href="https://www.instagram.com/agmaschwa/">
            <img src="{img_instagram}" alt="instagram" class="non-previewable-icon">
        </a>
        <a href="https://www.facebook.com/agmaschwa-111216610558363/">
            <img src="{img_facebook}" alt="facebook" class="non-previewable-icon">
        </a>
        <a href="https://www.reddit.com/r/AgmaSchwa/">
            <img src="{img_reddit}" alt="reddit" class="non-previewable-icon">
        </a>
        <a href="https://www.twitch.tv/agmaschwa">
            <img src="{img_twitch}" alt="twitch" class="non-previewable-icon">
        </a>
        <a href="https://github.com/Agma-Schwa/nguh.org">
            <img src="{img_github}" alt="github" class="non-previewable-icon">
        </a>
    </div>
</div>
