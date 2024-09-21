<script lang="ts">
    import {afterNavigate} from "$app/navigation";
    import {onMount} from "svelte";
    import {browser} from "$app/environment";
    function InitHeader() {

        let nav = document.getElementsByTagName('header')[0]

        /// Some pages may not have a header
        if (!nav) return

        nav.style.background = '#1e1e1e'
        nav.style.setProperty('--nav-box-shadow', '-10px 10px 1rem rgba(0, 0, 0, .4)')
        nav.style.setProperty('--nav-a-colour', 'var(--accentmedium)')

        /*            let navright = document.querySelector('nav') as HTMLElement
                let hamburger_container = document.getElementById('hamburger-container')
                new MouseoverContext(media_phone, hamburger_container, navright)
                    .onenter(() => navright.style.display = 'flex')
                    .onleave(() => navright.style.display = 'none')
                    .ontoggleon('leave')
                    .ontoggleoff('enter')
                    .toggleonclick(true)

                let collapse_container = document.getElementById('other-collapsable') as HTMLElement
                let collapse_into_other = [...collapse_container.children] as HTMLElement[]
                new MouseoverContext(media_laptop, document.getElementById('page_other'), ...collapse_into_other)
                    .onenter(() => {
                        collapse_into_other.forEach(el => el.style.display = 'inline-block')
                        collapse_container.style.display = 'flex'
                    })
                    .onleave(() => {
                        collapse_into_other.forEach(el => el.style.display = 'none')
                        collapse_container.style.display = 'contents'
                    })
                    .ontoggleon('leave')
                    .ontoggleoff(() => {
                        collapse_into_other.forEach(el => el.style.display = 'block')
                        collapse_container.style.display = 'contents'
                    })
                    .toggleonclick(true)*/
    }

    const media_mobile = browser ? window.matchMedia('(max-width: 900px)') : null
    const media_laptop = browser ? window.matchMedia('(max-width: 1250px)  and (min-width: 900px)') : null
    let collapse_container: HTMLElement
    let collapse_into_other: HTMLElement[]
    let navright: HTMLElement
    let hamburger_container: HTMLElement
    let other_toggled = false

    function __ReloadOther() {
        /// Collect relevant elements.
        if (!collapse_container) collapse_container = document.getElementById('other-collapsable') as HTMLElement
        if (!collapse_into_other) collapse_into_other = [...collapse_container.children] as HTMLElement[]
    }

    function __ReloadHamburger() {
        if (!navright) navright = document.querySelector('nav') as HTMLElement
        if (!hamburger_container) hamburger_container = document.getElementById('hamburger-container') as HTMLElement
    }

    function __Reset() {
        __ReloadOther()
        __ReloadHamburger()
        collapse_into_other.forEach(el => el.style.removeProperty('display'))
        collapse_container.style.removeProperty('display')
        navright.style.removeProperty('display')
    }

    function EnterOther() {
        if (media_laptop?.matches) {
            __ReloadOther()
            collapse_into_other.forEach(el => el.style.display = 'inline-block')
            collapse_container.style.display = 'flex'
        }
    }

    function LeaveOther() {
        if (media_laptop?.matches) {
            __ReloadOther()
            if (!other_toggled) {
                collapse_into_other.forEach(el => el.style.display = 'none')
                collapse_container.style.display = 'contents'
            }
        }
    }

    function ToggleHamburger() {
        if (media_mobile?.matches) {
            __ReloadHamburger()
            if (navright.style.display === 'flex') navright.style.display = 'none'
            else navright.style.display = 'flex'
        }
    }

    function HandleClickOnWindow(e: MouseEvent) {
        /// Hide the menu if it is toggled.
        if (media_laptop?.matches) {
            __ReloadOther()
            if (e.target === document.querySelector('#page_other')) return
            if (other_toggled) {
                other_toggled = false
                LeaveOther()
            }
        }

        /// Hide the hamburger menu if it is open.
        if (media_mobile?.matches) {
            __ReloadHamburger()
            if (
                e.target === document.querySelector('#hamburger-container') ||
                e.target === document.querySelector('#hamburger')
            ) return
            if (navright.style.display === 'flex') navright.style.display = 'none'
        }
    }

    export function UpdateActiveHeader() {
        function Update() {
            __Reset()

            /// Toggle laptop layout.
            if (media_laptop!.matches) {
                collapse_container.style.display = 'flex'
                collapse_into_other.forEach(el => el.style.display = 'none')
            }

            /// Toggle mobile layout
            else if (media_mobile!.matches) {
                collapse_into_other.forEach(el => el.style.display = 'inline-block')
            }

            /// Toggle normal layout
            else { }
        }

        media_mobile!.addEventListener('change', Update)
        media_laptop!.addEventListener('change', Update)

        Update()

        /// Unset all pages.
        for (const link of document.querySelectorAll("header a"))
            link.classList.remove('a-active')

        /// Set current page as active.
        let filename = location.href.split('/').slice(-1).join('')
        if (!filename) document.getElementById('page_index')?.classList.add('a-active')
        else {
            /// Some pages belong to a group. Highlight the group if we’re not on mobile.
            if (!media_mobile?.matches) {
                if (location.pathname.startsWith('/languages/'))
                    document.getElementById('page_languages')?.classList.add('a-active')
                else if (location.pathname.startsWith('/tools/'))
                    document.getElementById('page_tools')?.classList.add('a-active')
            }

            /// Highlight the page.
            const active_link = document.getElementById(`page_${filename}`)
            if (active_link) active_link.classList.add('a-active')
        }

        /// Some pages may not have a header
        let nav = document.getElementsByTagName('header')[0]
        if (!nav) return

        nav.style.background = '#1e1e1e'
        nav.style.setProperty('--nav-box-shadow', '-10px 10px 1rem rgba(0, 0, 0, .4)')
        nav.style.setProperty('--nav-a-colour', 'var(--accentmedium)')
    }

    onMount(UpdateActiveHeader)
    afterNavigate(UpdateActiveHeader)
</script>

<svelte:window on:click={HandleClickOnWindow} />

<header>
    <div class="flex-row">
        <a href="/" class="page_index_a" id="page_index">
            <img src="$lib/images/agma_logo.png" alt="agma_logo" class="non-previewable-icon">
            <span id="page-index-text">AGMA SCHWA</span>
        </a>
        <div id="hamburger-container" on:click={ToggleHamburger}>
            <svg width="1.5em" height="1.2em" version="1.1" xmlns="http://www.w3.org/2000/svg"
                 id="hamburger">
                <rect width="1.5em" height=".2em"/>
                <rect width="1.5em" height=".2em" y=".5em"/>
                <rect width="1.5em" height=".2em" y="1em"/>
            </svg>
        </div>
    </div>
    <nav>
        <a href="/the-channel" id="page_the-channel">The Channel</a>
        <div id="languages-drop-down">
            <a href="/languages" id="page_languages">Languages</a>
            <div id="languages-drop-down-content">
                <a href="/languages/alkan" id="page_alkan">Alkan</a>
                <a href="/languages/arodjun" id="page_arodjun">Arodjun</a>
                <a href="/languages/hallowed-ween" id="page_hallowed-ween">Hallowed Ween</a>
                <a href="/languages/hvasvan" id="page_hvasvan">Hvasvan</a>
                <a href="/languages/hyperformal" id="page_hyperformal">HyperFormal</a>
                <a href="/languages/hyperpirate" id="page_hyperpirate">HyperPirate</a>
                <a href="/languages/gumsmaq" id="page_gumsmaq">Gumsmaq</a>
                <a href="/languages/nashan" id="page_nashan">Nashan</a>
                <a href="/languages/permechikan" id="page_permechikan">Permechikan</a>
                <a href="/languages/portugoose" id="page_portugoose">Portugoose</a>
                <a href="/languages/prins" id="page_prins">Prins</a>
                <a href="/languages/pthm" id="page_pthm">pʰ.ð.m</a>
                <a href="/languages/rabbid" id="page_rabbid">Rabbid</a>
                <a href="/languages/santaa" id="page_santaa">Santaa</a>
                <a href="/languages/secret-handshake" id="page_secret-handshake">Secret Handshake</a>
                <a href="/languages/ultrafrench" id="page_ultrafrench">ULTRAFRENCH</a>
                <a href="/languages/xomitec" id="page_xomitec">Xo:mi.te;</a>
            </div>
        </div>
        <a href="/comic" id="page_comic">Comic</a>
        <a href="/merch" id="page_merch">Merch</a>
        <div id="other-collapsable">
            <div class="other-drop-down"
                on:mouseenter={EnterOther}
                on:mouseleave={LeaveOther}>
                <a href="/tools" id="page_tools">Tools</a>
                <div class="other-drop-down-content drop-down-content-centre">
                    <a data-sveltekit-reload href="/tools/hunger_games_simulator" class="child-element"
                       id="page_hunger_games_simulator">Hunger Games Simulator</a>
                    <a href="/tools/speedrun" class="child-element" id="page_speedrun">Speedrun</a>
                    <a href="/ccc/vote" class="child-element" id="page_ccc_vote">CCC Voting Form</a>
                </div>
            </div>

            <a href="/gambian_holiday" id="page_gambian_holiday"
                on:mouseenter={EnterOther}
                on:mouseleave={LeaveOther}
            >Gambian Holiday Wiki</a>

            <a href="/support-us" id="page_support-us"
                on:mouseenter={EnterOther}
                on:mouseleave={LeaveOther}
            >Support Us</a>
        </div>
        <div
            id="page_other"
            on:mouseenter={EnterOther}
            on:mouseleave={LeaveOther}
            on:click={() => other_toggled = !other_toggled}
        >Other</div>
    </nav>
</header>

<style lang="scss">
    $navbar-height: 4rem;

    #hamburger {
        pointer-events: none;
    }

    @media only screen and (max-width: 900px) {
        nav {
            overflow-y: scroll;
            max-height: calc(100vh - #{$navbar-height});
        }
    }
</style>