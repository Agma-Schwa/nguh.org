<script lang="ts">
    import SimpleDialog from "$lib/components/dialog/SimpleDialog.svelte";
    let dialog: SimpleDialog
</script>

<SimpleDialog bind:this={dialog} title="Changelog">
    <div id="changelog" class="pl-8 pr-8">
        <div class='changelog-day'>
            <h4>24 January 2025</h4>
            <ul>
                <li>
                    Fixed a CSS bug that caused tribute images to not be cropped properly sometimes.
                </li>
            </ul>
        </div>
        <div class="changelog-day">
            <h4>21 January 2025</h4>
            <ul>
                <li>Characters now persist across page reloads (they are stored locally in your browser).</li>
                <li>All of nguh.org is now on Svelte 5.</li>
                <li>Refactored the Hunger Games Simulator to actually leverage Svelte.</li>
                <li>The ‘OK’ button of file dialogs is now disabled when no file is selected.</li>
                <li>The ‘Clear’ and ‘Download’ buttons in the event list are now disabled when the list is empty.</li>
                <li>Improved centering and alignment of the add character button.</li>
                <li>Moved event message syntax into a separate dialog.</li>
                <li>Added a setting to set the starting day/night of the game.</li>
            </ul>
        </div>
        <div class="changelog-day">
            <h4>28 October 2024</h4>
            <ul>
                <li>
                    Added a format specifier, <code>%w</code>, for ‘was/were’.
                </li>
            </ul>
        </div>
        <div class="changelog-day">
            <h4>25 September 2024</h4>
            <ul>
                <li>
                    Added a format specifier, <code>%e</code>, for verbs that have ‘-es’ in the
                    3rd person singular, e.g. ‘bash/bashes’, ‘catch/catches’.
                </li>
                <li>
                    Updated the description to reflect the fact that you can now add events directly
                    from the events dialog without having to download and upload a JSON file.
                </li>
            </ul>
        </div>
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
</SimpleDialog>

<button class="mt-4" onclick={() => dialog.open()}>Changelog</button>

<style>
    #changelog { max-width: min(90rem, 100vw);    }
    .changelog-day + .changelog-day { margin-top: 1.5rem; }
    h4 { margin: 0; }
    code { color: var(--accentlight); }
</style>