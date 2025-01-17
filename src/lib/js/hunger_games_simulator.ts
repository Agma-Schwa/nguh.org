/* eslint-disable */
import {Dialog, FileType, UserError} from "$lib/js/dialog";
import {FormatError} from "$lib/js/trace";

const light_accent = '#cea964'
const accent_black = '#1e1e1e'
const max_strace_depth = 15

/// ====================================================================== ///
///  DOM Elements and Templates                                            ///
/// ====================================================================== ///

/// The <div> containing the ui to set up a game
let create_game = document.getElementById('create-game') as HTMLElement

/// The <div> containing all the characters
let character_selects = document.getElementById('character-selects') as HTMLElement

let game_title = document.getElementById('game-title') as HTMLElement
let game_content = document.getElementById('game-content') as HTMLElement
let game_before_content = document.getElementById('game-before-content') as HTMLElement
let start_game_button = document.getElementById('start-game-button') as HTMLElement

let game_character_template = (<HTMLTemplateElement>document.getElementById('game-character-setup-template')).content
let event_message_template = (<HTMLTemplateElement>document.getElementById('event-message-template')).content
let death_message_template = (<HTMLTemplateElement>document.getElementById('death-message-template')).content
let game_fatalities_template = (<HTMLTemplateElement>document.getElementById('game-fatalities-template')).content
let tribute_stats_wrapper_template = (<HTMLTemplateElement>document.getElementById('tribute-stats-wrapper-template')).content
let tribute_stats_template = (<HTMLTemplateElement>document.getElementById('tribute-stats-template')).content
let edit_events_table_template = (<HTMLTemplateElement>document.getElementById('edit-events-table-template')).content
let add_events_template = (<HTMLTemplateElement>document.getElementById('add-events-template')).content
let changelog_dialog_template = (<HTMLTemplateElement>document.getElementById('changelog-dialog-template')).content
let settings_dialog_template = (<HTMLTemplateElement>document.getElementById('settings-dialog-template')).content

let current_players = document.getElementById('current-players') as HTMLElement
let player_count = 0

character_selects.innerHTML +=
    `<div id="add-character-button-wrapper">`
    + `<button id="add-character" type="button"></button>`
    + `</div>`
let add_character_button = document.getElementById('add-character-button-wrapper') as HTMLElement




/** Create a data URL for an object's JSON representation. */
function ObjectToDataURL(obj: any) {
    return 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(obj, null, 4))
}

/**
 * Parse a string as an array of numbers.
 *
 * @param str A string like `'[1, 2, 3, 4]'` or `'[]'`.
 * @return A possibly empty `number[]`, or `null` if there was an error.
 */
function ParseNumberArray(str: string): number[] | null {
    try { var parsed = JSON.parse(str) } catch (e) { return null }
    if (!Array.isArray(parsed) || !parsed.every(el => typeof el == 'number')) return null
    return parsed
}

/** Remove all child nodes from an element. */
function RemoveAllChildNodes(parent: HTMLElement) {
    while (parent.firstChild) parent.removeChild(parent.firstChild)
}

/** Create a Blob from a string */
function StringToBlob(str: string, mime_type: string = "application/json"): Blob {
    return new Blob([str], {type: mime_type})
}

/** Create a Blob from a string */
function StringToObjectURL(str: string): string {
    return URL.createObjectURL(StringToBlob(str))
}

/// ====================================================================== ///
///  Page                                                                  ///
/// ====================================================================== ///

/// Changelog dialog.
const changelog_dialog = Dialog.make<void>('Changelog', changelog_dialog_template.cloneNode(true), ['OK'], 'changelog-dialog', false)
changelog_dialog.on('__CLOSE__', d => d.resolve())
changelog_dialog.on('OK', d => d.resolve())

/// Open it when the corresponding button is pressed.
;(document.getElementById('open-changelog') as HTMLElement).onclick = async () => await changelog_dialog.open()

/// Settings dialog.
const settings_dialog = Dialog.make<void>('Settings', settings_dialog_template.cloneNode(true), ['OK'], 'settings-dialog', false)
settings_dialog.on('__CLOSE__', d => d.resolve())
settings_dialog.on('OK', d => d.resolve())

/// Open it when ‘Settings’ is pressed.
;(document.getElementById('open-settings') as HTMLElement).onclick = async () => await settings_dialog.open()

/// Get certain settings
const enum SettingsFatalitiesMode {
    Disable = 'Disable',
    Percent = 'Percent',
    Absolute = 'Absolute',
}
const settings_fatalities_mode = document.getElementById('settings-dialog-fatalities-mode') as HTMLSelectElement
const settings_fatalities_value = document.getElementById('settings-dialog-fatalities-value') as HTMLInputElement

/// Enable certain settings.
void function InitSettingsDialog() {
    settings_fatalities_mode.value = SettingsFatalitiesMode.Disable
    settings_fatalities_value.disabled = true
    settings_fatalities_mode.onchange = () => {
        switch (settings_fatalities_mode.value) {
            case SettingsFatalitiesMode.Disable:
                settings_fatalities_value.disabled = settings_fatalities_mode.value === SettingsFatalitiesMode.Disable
                break

            case SettingsFatalitiesMode.Percent:
                settings_fatalities_value.disabled = false
                settings_fatalities_value.min = '0'
                settings_fatalities_value.max = '100'
                settings_fatalities_value.step = '5'
                settings_fatalities_value.value = '10'
                break

            case SettingsFatalitiesMode.Absolute:
                settings_fatalities_value.disabled = false
                settings_fatalities_value.min = '1'
                if (settings_fatalities_value.attributes.getNamedItem('max'))
                    settings_fatalities_value.attributes.removeNamedItem('max')
                settings_fatalities_value.step = '1'
                settings_fatalities_value.value = '1'
                break
        }
    }
}()

/// ====================================================================== ///
///  Adding Characters                                                     ///
/// ====================================================================== ///

/** Add an empty character to the character selection screen. */
function AddCharacter() {
    PrepareAddingCharacter()

    /// Add the new character.
    character_selects.appendChild(game_character_template.cloneNode(true))

    FinishAddingCharacter()
}

/// We need to call this function from outside this script.
/// @ts-ignore
window.AddCharacter = AddCharacter

/**
 * Add a character to the character selection screen.
 *
 * @param imgsrc The URL of the image to be used for this character.
 * @param name The name of this character.
 */
function AddCharacterFromImage(imgsrc: string, name: string) {
    PrepareAddingCharacter()

    /// Append the new character and set the image and name.
    character_selects.appendChild(game_character_template.cloneNode(true))

    /// @ts-ignore
    character_selects.lastElementChild.getElementsByClassName("character-name")[0].value = name

    /// @ts-ignore
    character_selects.lastElementChild.getElementsByClassName("tribute-image")[0].src = imgsrc

    /// Add the button again.
    FinishAddingCharacter()
}

/** Display/Hide the custom gender input when appropriate. */
function ChangeSelect(select: any) {
    let input = select.parentElement.parentElement.getElementsByClassName('custom-gender-input-wrapper')[0]
    input.style.display = (select.value === 'other' ? 'flex' : 'none')
}

/** Append the add character button and add the event listeners. */
function FinishAddingCharacter() {
    character_selects.appendChild(add_character_button)
    RegisterEventListeners()
}

/** Remove the add character button and update the player count. */
function PrepareAddingCharacter() {
    /// Remove the button and update the player count.
    add_character_button.remove()
    current_players.innerHTML = 'Current Players: ' + ++player_count
}

/** Reinstall all event listeners for the character selection EventsDialog. */
function RegisterEventListeners() {
    for (let img of document.getElementsByClassName('tribute-image') as HTMLCollectionOf<HTMLElement>)
        img.onclick = () => GetImage(img as HTMLImageElement)
    for (let select of document.getElementsByClassName('gender-select') as HTMLCollectionOf<HTMLElement>)
        select.onchange = () => ChangeSelect(select)
    for (let button of document.getElementsByClassName('character-delete') as HTMLCollectionOf<HTMLElement>)
        button.onclick = () => {
            /// @ts-ignore
            button.parentElement.parentElement.parentElement.remove()
            current_players.innerHTML = 'Current Players: ' + --player_count
        }
    for (let button of document.getElementsByClassName('image-remove'))
        /// @ts-ignore
        button.onclick = () => button.parentElement.parentElement.parentElement.children[1].children[0].src = ''

    add_character_button.onclick = () => AddCharacter()
}

/// ====================================================================== ///
///  Events and UI                                                         ///
/// ====================================================================== ///
namespace UI {
    export let events_dialog: Dialog<void> | null = null;

    /** Create and display the events dialog. */
    export function OpenEventsDialog() {
        if (events_dialog) {
            events_dialog.__data.events_changed_map.clear()
            events_dialog.open().and(ApplyEventChanges)
            return
        }

        /// Create the dialog if it doesn't exist yet
        let div = document.createElement('div')
        div.style.display = 'block'

        /// The dialog contents are in a shadow root to get rid
        /// of all the CSS that that page would otherwise provide.
        div.attachShadow({mode: 'open'})
        let shadow = div.shadowRoot as EventsShadowRoot
        shadow.appendChild(edit_events_table_template.cloneNode(true))
        shadow.events_changed_map = new Map()

        /// Set up the dialog.
        events_dialog = Dialog.make<void>('Settings', div, ['OK', 'Apply', 'Cancel'], 'events-dialog', false)
        events_dialog.content.insertAdjacentHTML('afterbegin', 'You can add, enable, disable, download, and upload events below')
        events_dialog.on('Apply', ApplyEventChanges)
        events_dialog.on('Cancel', d => d.reject())
        events_dialog.on('OK', d => {
            ApplyEventChanges()
            d.resolve()
        })
        events_dialog.__data = {}
        events_dialog.__data.events_table = shadow.getElementById('edit-events-table') as HTMLTableElement
        events_dialog.__data.events_changed_map = shadow.events_changed_map
        RefreshEvents()

        /// Actually show the dialog.
        OpenEventsDialog()
    }

    /** Reload the events table from the event list. */
    export function RefreshEvents() {
        if (!UI.events_dialog) return

        let tbodies: HTMLElement[] = []
        for (let el of (UI.events_dialog).__data.events_table.children)
            if (el.tagName === 'TBODY')
                tbodies.push(el as HTMLElement)
        for (let el of tbodies) el.remove()

        let events = new Map()
        for (let event_list of Object.keys(Game.event_lists)) {
            if (!events.has(event_list)) events.set(event_list,
                `<tbody class="edit-events-tbody"><tr class="event-list-stage-header"><td></td><td>` +
                `${event_list.charAt(0).toUpperCase() + event_list.slice(1)}</td><td></td><td></td><td></td><td></td></tr>`)

            let lst = events.get(event_list)
            /// @ts-ignore
            for (let event of Game.event_lists[event_list] as Event[])
                lst += `<tr onclick="HandleCheckbox(this.firstChild.firstChild)"><td><input data-id='${event.id}' `
                    + `onclick = "HandleCheckbox(this)" type="checkbox" ${event.enabled ? 'checked' : ''}></td>`
                    + `<td>${event.message}</td><td>${event.players_involved}</td><td>${event.type}</td>`
                    + `<td>${event.fatalities}</td><td>${event.killers}</td></tr>`

            events.set(event_list, lst)
        }

        for (let lst of Object.keys(Game.event_lists))
            (UI.events_dialog).__data.events_table
                .insertAdjacentHTML('beforeend', events.get(lst) + '</tbody>')
    }

    /** Enable/disable events based on whether they're checked/unchecked in the events table. */
    export function ApplyEventChanges() {
        if (UI.events_dialog) {
            for (let event_list of Object.keys(Game.event_lists))
                /// @ts-ignore
                for (let event of Game.event_lists[event_list])
                    if (UI.events_dialog.__data.events_changed_map.has(event.id))
                        event.enabled = UI.events_dialog.__data.events_changed_map.get(event.id)
        }
    }

    /** Download the current events as a JSON file. */
    export function SaveConfiguration() { DownloadURL('hgs-config.json', StringToObjectURL(JSON.stringify(Configuration.Save(), null, 4))) }

    /** Prompt the user to add a custom event. */
    export async function AddEvent() {
        const description = `<h5>Hunger Games Simulator Message Formatting</h5>
<p>For an event that involves <code>n</code> players, <code>%0</code> is the name of the 1st
    (!) player, <code>%1</code> that of the second, and so on. Each player has a set of pronouns. 
    A player is considered to be plural, if their pronouns are they/...
</p> 
<p>The ‘deaths’ and ‘killers’ are comma-separated lists of the numbers of the players who die or kill someone in an event. </p>
<p>The formatting codes look like this: <code>%Xn</code> or <code>%n</code>. The <code>n</code> is the number of the player;
    the 1st player has the number <code>0</code>. If there is no <code>X</code>, then you get the name of that player 
    (e.g. <code>%2</code> is the name of the 3rd player). Otherwise, <code>X</code> is one of the following:
</p>
<ul>
    <li><code>N</code> = nominative; e.g. <code>%N2</code> = ‘he’ if the 3rd player’s pronouns are he/…</li>
    <li><code>A</code> = accusative; e.g. <code>%A2</code> = ‘him’ if the 3rd player’s pronouns are he/…</li>
    <li><code>G</code> = genitive; e.g. <code>%G2</code> = ‘his’ if the 3rd player’s pronouns are he/…</li>
    <li><code>R</code> = reflexive; e.g. <code>%R2</code> = ‘himself’ if the 3rd player’s pronouns are he/…</li>
    <li><code>e</code> = 3rd person sg. ‘-es’; e.g. <code>bash%e2</code> = ‘bash’ if the 3rd player is plural, and ‘bashes’ otherwise</li>
    <li><code>s</code> = 3rd person sg. ‘-s’; e.g. <code>drink%s2</code> = ‘drink’ if the 3rd player is plural, and ‘drinks’ otherwise</li>
    <li><code>y</code> = ‘-y/-ies’; e.g. <code>fl%y2</code> = ‘fly’ if the 3rd player is plural, and ‘flies’ otherwise</li>
    <li><code>i</code> = ‘is/are’; e.g. <code>%i2</code> = ‘are’ if the 3rd player is plural, and ‘is’ otherwise</li>
    <li><code>h</code> = ‘has/have’; e.g. <code>%h2</code> = ‘have’ if the 3rd player is plural, and ‘has’ otherwise</li>
    <li><code>!</code> = ‘isn't/aren't’; e.g. <code>%!2</code> = ‘aren’t’ if the 3rd player is plural, and ‘isn’t’ otherwise</li>
    <li><code>w</code> = ‘was/were’; e.g. <code>%w2</code> = ‘were’ if the 3rd player is plural, and ‘was’ otherwise</li>
</ul>`

        const dialog = Dialog.make<void>('Add Event', description, ['Add', 'Cancel'], 'add-events-dialog')
        dialog.content.appendChild(add_events_template.cloneNode(true))
        dialog.on('Cancel', d => d.reject('User clicked Cancel'))
        dialog.on('Add', d => {
            /// Get the message, deaths, and killers.
            let [message, deaths_raw, killers_raw] = [...d.content.getElementsByTagName('input')].map(i => i.value.trim())

            /// The message may not be empty and must contain at least one player.
            if (!message.length) return Dialog.error('Message may not be empty')
            const involved = CalculateTributesInvolved(message)
            if (involved < 1 || involved > 9) return Dialog.error('Event message must contain between 1 and 9 players, inclusive.')

            /// Parse the deaths and killers and make sure they're number arrays
            let deaths = ParseNumberArray('[' + deaths_raw + ']')
            if (!deaths) return Dialog.error(`Invalid syntax for deaths: '${deaths_raw}'`)
            let killers = ParseNumberArray('[' + killers_raw + ']')
            if (!killers) return Dialog.error(`Invalid syntax for killers: '${killers_raw}'`)

            /// Make sure these make sense.
            if (Math.max(...deaths) > involved)
                return Dialog.error(`Invalid deaths '${deaths.toString()}' for event since it only involves ${involved} players`)
            if (Math.max(...killers) > involved)
                return Dialog.error(`Invalid killers '${killers.toString()}' for event since it only involves ${involved} players`)

            /// Try adding the event.
            try {
                let stage = d.content.getElementsByTagName('select')[0].value
                /// @ts-ignore
                Game.event_lists[stage].push(new Event(message, deaths, killers, 'CUSTOM'))
                RefreshEvents()
                dialog.resolve()
                /// @ts-ignore
            } catch (e) { Dialog.error(e) }
        })

        dialog.open().and()
    }

    /**
     * Load events from a file.
     *
     * @param overwrite Whether to delete the current event list first.
     */
    export function LoadConfigFile(overwrite = false) {
        Dialog.file('Select a file', {
            description: 'Please click on the button to choose a local file or simply input a URL.',
            preserve_extern_urls: false,
            type: FileType.JSON
        }).and(res => {
            Configuration.Load(res.data as object, overwrite)
            ApplyEventChanges()
            RefreshEvents()
        })
    }

    /** Remove all events from the event list. */
    export function Clear() {
        Dialog.confirm('This will remove ALL events. Continue?').and(() => {
            /// @ts-ignore
            Object.keys(Game.event_lists).forEach(k => Game.event_lists[k] = [])
            RefreshEvents()
        })
    }

    /** Reset the event list to its builtin state. */
    export function ResetEvents() {
        Dialog.confirm('This will reset the event lists to their builtin state. Continue?').and(() => {
            Configuration.Load(Configuration.default_config, true, true)
            RefreshEvents()
        })
    }

    /** Upload multiple images and add them as tributes. */
    export function AddMultiFiles() {
        Dialog.files('Upload Images', {
            description: '<p>Click below to select multiple files to add them as tributes.</p>',
            preserve_extern_urls: true,
            type: FileType.RAW,
        }).and(res => {
            for (const file of res.files as File[])
                if (file.type.startsWith('image'))
                    AddCharacterFromImage(URL.createObjectURL(file), file.name.slice(0, file.name.lastIndexOf(".")))
        })
    }

} /// namespace UI

/** Shadow root of the events dialog. */
interface EventsShadowRoot extends ShadowRoot {
    events_changed_map: Map<string, boolean>
}

/// ====================================================================== ///
///  Initialisation                                                        ///
/// ====================================================================== ///
/*
async function __Init() {
    try {
        const setup = localStorage.getItem(`setup`)
        if (setup) await Configuration.LoadCharacters(JSON.parse(setup))
        else Configuration.LoadDefaultCharacters()
    } catch (e) {
        Dialog.error(`Error loading saved characters: ${e}`)
    }
}

/// Load the config.
try {
    const config = localStorage.getItem(`config`)
    if (config) Configuration.Load(JSON.parse(config))
    else Configuration.LoadDefaultConfig();
} catch (e) {
    Dialog.error(`Error loading saved configuration: ${e}`)
}

if (document.readyState === 'complete') {
    __Init()
} else {
    window.addEventListener('DOMContentLoaded', __Init)
}

/// We need to be able to use the `Game` class outside this script.
/// @ts-ignore
window.Game = Game
*/
