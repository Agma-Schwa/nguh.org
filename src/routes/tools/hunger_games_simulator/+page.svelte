<script lang="ts">
    import '$lib/css/hunger_games_simulator.scss'
    import {onMount} from "svelte";
    import Page from "$lib/components/Page.svelte";
    import Stripe from "$lib/components/Stripe.svelte";

    let __impl
    onMount(() => {
        __impl = import('$lib/js/hunger_games_simulator')
    })
</script>

<Page name="Hunger Games Simulator" theme="dark" />

<svelte:head>
    <!-- FIXME: Extract metadata to separate component  -->
    <meta name="keywords" content="hunger games simulator hungergame hungergames hungergamessimulator humger-games simulator hunger-games-simulator">
</svelte:head>

<template id="game-character-setup-template">
    <form class="game-character">
        <div class="name-and-pronouns flex-column">
            <div class="flex-row">
                <button type="button" class="character-delete danger-button">Delete Character</button>
            </div>
            <div class="flex-row">
                <button type="button" class="image-remove">Remove Image</button>
            </div>

            <div class="flex-row"><label>Name:</label>
                <input class="character-name" name="character" type="text"></div>

            <div class="flex-row custom-gender-input-wrapper" style="display: none;"><label>Pronouns:</label>
                <input class="custom-gender-input" name="gender_input" placeholder="they/them/their/themself" type="text"></div>

            <div class="flex-row"><label>Pronouns:</label>
                <select class="gender-select" name="gender_select">
                    <option value="m">he/him/his/himself</option>
                    <option value="f">she/her/her/herself</option>
                    <option value="c">they/them/their/themself</option>
                    <option value="n">No Pronouns</option>
                    <option value="other">Other</option>
                </select>
            </div>
        </div>
        <div id="image-wrapper" class="image-wrapper"><img alt="Click to add an image" class="non-previewable-icon tribute-image"></div>
    </form>
</template>

<template id="event-message-template">
    <div class="event-message-wrapper flex-column flex-centre">
        <div class="event-message-images flex-row"></div>
        <p class="event-message"></p>
    </div>
</template>

<template id="death-message-template">
    <div class="death-message-wrapper flex-column flex-centre">
        <div class="death-message-image image-wrapper"></div>
        <p class="death-message"></p>
    </div>
</template>

<template id="game-fatalities-template">
    <div class="round-fatalities-wrapper flex-column flex-centre">
        <h6 class="round-title"></h6>
        <article class="round-fatalities"></article>
    </div>
</template>

<template id="tribute-stats-wrapper-template">
    <div class="tribute-stats-wrapper">
        <div class="alive-stats-wrapper">
            <div class="alive-stats"></div>
        </div>
        <div class="dead-stats-wrapper">
            <h3 class="tribute-stats-header">The Rest</h3>
            <div class="dead-stats"></div>
        </div>
    </div>
</template>

<template id="tribute-stats-template">
    <div class="tribute-stats flex-column flex-centre">
        <div class="tribute-image image-wrapper flex-row"></div>
        <p class="tribute-stats-name"></p>
        <p class="tribute-stats-kills">Kills: 0</p>
        <p class="tribute-stats-died"></p>
    </div>
</template>

<template id="add-events-template">
    <div id="add-events-dialog-content">
        <label for="input_stage">Stage</label>
        <select name="input_stage" id="input_stage">
            <option value="bloodbath">Bloodbath</option>
            <option value="day" selected>Day</option>
            <option value="night">Night</option>
            <option value="feast">Feast</option>
            <option value="all">All</option>
        </select>

        <label for="input_message">Message</label>
        <input type="text" name="input_message" id="input_message" placeholder="%0 and %1 track down and kill %2.">

        <label for="input_deaths">Deaths</label>
        <input type="text" name="input_deaths" id="input_deaths" placeholder="2">

        <label for="input_killers">Killers</label>
        <input type="text" name="input_killers" id="input_killers" placeholder="0, 1">
    </div>
</template>

<template id="edit-events-table-template">
    <script>
        function HandleCheckbox(checkbox) {
            checkbox.checked = !checkbox.checked
            checkbox.getRootNode().events_changed_map.set(+checkbox.dataset.id, checkbox.checked)
        }
    </script>
    <script src="game" type="module" defer></script>
    <div id="tribute-stats-buttons">
        <button onclick="Game.UI.AddEvent()"><abbr title="This will add events if they're not already in the list">Add</abbr></button>
        <button onclick="Game.UI.Clear()"><abbr title="This will remove all events from the event list">Clear</abbr></button>
        <button onclick="Game.UI.SaveConfiguration()">Download</button>
        <button onclick="Game.UI.LoadConfigFile(false)"><abbr title="This will upload events if they're not already on the list">Upload and Add</abbr></button>
        <button onclick="Game.UI.LoadConfigFile(true)"><abbr title="Caution! This will completely overwrite the current event list">Upload and Replace</abbr></button>
        <button onclick="Game.UI.ResetEvents()"><abbr title="This will reset the event lists to contain only builtin events">Reset</abbr></button>
    </div>
    <div id="edit-events-table-wrapper">
        <table id="edit-events-table" class="table-no-style">
            <thead>
            <tr>
                <th></th>
                <th>Message</th>
                <th>Players</th>
                <th>List</th>
                <th>Deaths</th>
                <th>Killers</th>
            </tr>
            </thead>
            <!--		/<tbody id="edit-events-tbody"></tbody>-->
        </table>
    </div>
</template>

<template id="settings-dialog-template">
    <div class="dialog-spaced">
        <p style="max-width: 50ch;">Mouse over the names of settings (e.g. ‘Deaths per Round’) for a more detailed description.</p>
        <button id="edit-events" onclick="Game.UI.OpenEventsDialog()">Edit Events</button>
        <fieldset>
            <!-- Do NOT indent the second line here as that will indent the text in the tooltip. -->
            <legend><abbr title="The Simulator will try to make sure that this many tributes die each round.
If specified in percent, this is relative to the total number of tributes, alive or dead.">Deaths per Round</abbr></legend>
            <select id="settings-dialog-fatalities-mode">
                <option value="Disable">Disable</option>
                <option value="Percent">Percent (max: 100)</option>
                <option value="Absolute">Players</option>
            </select>
            <input type="number" id="settings-dialog-fatalities-value">
        </fieldset>
    </div>
</template>

<template id="changelog-dialog-template">
    <div id="changelog">
        <div class="changelog-day">
            <h4>18 April 2024</h4>
            <ul>
                <li>
                    The entirety of nguh.org, including this simulator, is now open source on
                    <a href="https://github.com/Agma-Schwa/nguh.org">GitHub</a>.
                </li>
            </ul>
        </div>
        <div class="changelog-day">
            <h4>09 April 2024</h4>
            <ul>
                <li>
                    Events involving fatalities are no longer grouped at the top when a fixed number or percentage
                    of deaths per round is set. Instead, the events are now shuffled and distributed more evenly.
                </li>
            </ul>
        </div>
        <div class="changelog-day">
            <h4>22 February 2024</h4>
            <ul>
                <li>Added a <code>%h</code> format specifier for ‘has/have’.</li>
            </ul>
        </div>
        <div class="changelog-day">
            <h4>26 July 2023</h4>
            <ul>
                <li>Updated the page layout to be more similar to the rest of the website.</li>
                <li>
                    The source code available on the HGS repository may no longer up to date as it has
                    been reintegrated into the rest of the page. We’re exploring separating it again in
                    case people are interested it and will be posting an update here in the changelog as
                    soon as that happens.
                </li>
            </ul>
        </div>
        <div class="changelog-day">
            <h4>12 May 2023</h4>
            <ul>
                <li>Fixed a bug that made it impossible to re-enable disabled events in the events dialog.</li>
                <li>This was also causing some weirdness when loading event lists with mostly disabled events,
                    which should be fixed now.</li>
            </ul>
        </div>
        <div class="changelog-day">
            <h4>28 February 2023</h4>
            <ul>
                <li>Linguistics-related events that might not be that easy to make sense of
                unless you’re familiar with linguistics are now disabled by default. You can
                still enable them in the settings if you want to.</li>
                <li>Consequently, any events with the <code>BIG LANG</code> type will now be disabled
                when loaded. Most people’s configs and custom events should not be affected by this as
                that event type isn’t really supposed to be used for non-builtin events anyway.</li>
                <li>Fixed a bug that would cause players to only be awarded 1 kill per event, even
                if an event has multiple fatalities.</li>
            </ul>
        </div>
        <div class="changelog-day">
            <h4>22 February 2023</h4>
            <ul>
                <li>The Settings dialog now contains more settings. The events dialog can now
                be opened from the Settings dialog.</li>
                <li>Added an option to the settings dialog to set a maximum number of players
                that may die each round. This setting is disabled by default.</li>
                <li>Tributes and event text should now be centred properly in game.</li>
                <li>When displaying events that involve a lot of tributes, the tributes now wrap
                properly and are centred and spaced properly.</li>
            </ul>
        </div>
        <div class="changelog-day">
            <h4>29 January 2023</h4>
            <ul>
                <li>Due to popular request, the ‘Save Characters’ button now saves uploaded images as well!</li>
                <li>As a result, the downloaded config files will now be a lot larger if you’ve uploaded many large files;
                    we’re looking into scaling down the images on save, but that may take a while to implement.
                </li>
                <li>Old config files still work; it’s just that those files didn’t save uploaded images properly, so if you
                    have an old config file, any uploaded images in those config files will still be broken.
                </li>
                <li>If you have any old config files, we recommend updating them by uploading them (‘Load Characters’) and
                    downloading them again (‘Save Characters’). However, old config files will still continue to work regardless
                    and we plan to continue supporting them indefinitely.</li>
            </ul>
        </div>
        <div class="changelog-day">
            <h4>6 July 2022</h4>
            <ul>
                <li>
                    Previously, the simulator would display an exception + stacktrace when trying to upload a non-JSON file in a context
                    where JSON was expected. The simulator now displays an error message that explains that the file is not valid JSON instead.
                </li>
                <li>As you can see, the changelog has been moved to this dialog because it was getting too long.</li>
                <li>Dialogs now appear properly centred when opened.</li>
                <li>
                    The simulator should now function correctly should you try and start a game with no events whatsoever. Of course, it will
                    never get anywhere, but at least it won't crash horribly.
                </li>
            </ul>
        </div>
        <div class="changelog-day">
            <h4>3 July 2022</h4>
            <ul>
                <li>The old dialog API has been replaced with a newer one.</li>
                <li>Dialogs now use the HTML5 <code>&lt;dialog&gt;</code> element.</li>
                <li>Dialogs are now draggable and scrollable.</li>
                <li>Dialogs now stack properly.</li>
                <li>
                    The input box of single file dialogs now becomes locked after selecting a file from the file manager, signifying that
                    a file has been chosen and uploaded.
                </li>
                <li>Error dialogs that display exceptions now contain stack traces as well as instructions as to how to report a bug.</li>
            </ul>
        </div>
        <div class="changelog-day">
            <h4>2 July 2022</h4>
            <ul>
                <li>
                    The ‘Save Characters’/‘Load Characters’ buttons no longer save/load events, only characters. This
                    also fixes a bug that would cause people to be unable to start a game after loading characters.
                </li>
            </ul>
        </div>
        <div class="changelog-day">
            <h4>26 June 2022</h4>
            <ul>
                <li>The source code for the simulator has been moved to a separate GitLab repository that is now accessible
                    to the public (see the ‘Source Code, ...’ section above).
                </li>
                <li>Several buttons have been renamed: ‘Edit Events’ is now ‘Settings’; ‘Save Setup’ and ‘Load Setup’ are now
                    ‘Save Characters’ and ‘Load Characters’.
                </li>
                <li>The format for the config file that can be downloaded by clicking on Settings > Download has changed.
                    You can still upload your old config files; however, when you download it again afterwards, the format will
                    have changed.
                </li>
                <li>The event message formatter has been updated to give more helpful error messages if the message format is
                    invalid.
                </li>
            </ul>
        </div>
        <div class="changelog-day">
            <h4>13 June 2022</h4>
            <ul>
                <li>The ‘Add’ and ‘Load’ buttons in the events dialog have been renamed to ‘Upload and Add’ and ‘Upload and
                    Replace’, respectively.
                </li>
                <li>We've added a UI that should make adding events easier. You can access it by clicking on the new ‘Add’
                    button in the events dialog.
                </li>
                <li>The names of all stages should now be capitalised properly.</li>
            </ul>
        </div>
    </div>
</template>

<h2 class="stripe"><span>Info</span></h2>
<div id="game-wrapper">
    <div id="create-game">
        <section>
            <div class="flex-row gap2">
                <article>
                    <p>
                        This Hunger Games Simulator exists because we were displeased with the
                        other simulators out there; the one that we were using prior to the creation
                        of this one (the one at brantsteele.net) made it very difficult to upload images
                        and was utilising a needlessly convoluted server-driven system.
                    </p>
                    <p>
                        This simulator was created to address both of those shortcomings. With it, you can easily upload
                        whatever images you want. You can also just give it a URL that points to a publicly accessible image,
                        and it will work just fine—so long as your browser supports it, that is.
                    </p>
                    <p>
                        What's more, this simulator runs entirely in the browser, meaning that you could even download
                        the page and use it offline if you so desired. This also means that it should be faster than
                        the simulator we were using before, since it does not need to send data to a server and back
                        every single time you press a button.
                    </p>
                </article>
                <div class="center flex-column gap1">
                    <img src="$lib/images/agma_logo_white.png" alt="Agma Schwa Logo" class="small-image">
                    <a class="bright-link" href="https://www.youtube.com/@AgmaSchwa">Subscribe to Agma Schwa</a>
                </div>
            </div>
            <p>
                The events are mainly taken from the brantsteele.net simulator, though some members of our community
                have contributed to the event list as well. You can disable existing events or add custom events by
                clicking the ‘Edit Events’ button below. Currently, the only way to add your own events is to download
                all events as json, modify the file, and reupload them.
            </p>
        </section>

        <Stripe>Source Code, Bug Reports, Contributing, etc.</Stripe>
        <section>
            <p>
                If you'd like to report a bug or suggest a feature, you can do so on the
                <a href="https://discord.gg/zCA2Urv7Tc">Agma Schwa Discord Server</a>. Just @ the Mods and
                someone will come and help you.
            </p>
            <p>
                Alternatively, you can also file an issue <a href="https://github.com/Agma-Schwa/nguh.org/issues/new?assignees=Sirraide&labels=Hunger+Games+Simulator&projects=&template=hunger-games-simulator-bug.md&title=%5BHGS%5D+Insert+a+brief+description+of+your+problem+here">
                here</a>. This requires you to have a free GitHub account.
            </p>
            <p>
                The source code of nguh.org, including the Hunger Games Simulator, is hosted in
                <a href="https://github.com/Agma-Schwa/nguh.org">this GitHub repository</a>.
            </p>
            <p>
                Support the game developer, Ætérnal, on <a href="https://www.patreon.com/sirraide">Patreon</a>.
            </p>
            <p>
                Thanks also to GitHub user @spaulmark for implementing the bulk-upload feature.
            </p>
            <button id="open-changelog">Changelog</button>
            <!--<h3>New Features</h3>
            <p>
                Due to popular request, character setups created by ‘Save Characters’ will now also be able
                to save uploaded images. See the Changelog above for more details.
            </p>-->

        </section>
        <Stripe>Choose your characters</Stripe>
        <section>
            <div id="player-stats"><p id="current-players">Current Players: 0</p></div>
            <button id="open-settings">Settings</button>
            <button id="save-setup" onclick="Game.UI.SaveCharacters()">Save Characters</button>
            <button id="load-setup" onclick="Game.UI.LoadCharacters()">Load Characters</button>
            <button id="add-images" onclick="Game.UI.AddMultiFiles()">Upload Images</button>
            <div id="character-selects"></div>
            <div id="start-game-wrapper">
                <button type="button" id="start-game-button" onclick="Game.CreateGame()">Start Game</button>
            </div>
        </section>
    </div>
    <div id="game">
        <section id="game-content-wrapper">
            <h3 id="game-title"></h3>
            <p id="game-before-content"></p>
            <div id="game-content"></div>
            <div class="flex-row" id="game-buttons-wrapper">
                <button id="advance-game">Proceed</button>
                <button id="abort-game" class="danger-button" onclick="Game.AbortGame()">Abort Game</button>
            </div>
        </section>
    </div>
</div>