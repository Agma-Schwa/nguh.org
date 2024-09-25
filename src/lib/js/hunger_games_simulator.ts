/* eslint-disable */
import {Dialog, FileType, UserError} from "$lib/js/dialog";
import {FormatError} from "$lib/js/trace";
import default_image_src from '$lib/images/hgs-default-character.png'

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

/// ====================================================================== ///
///  Utils                                                                 ///
/// ====================================================================== ///
interface InnerHTML {
    value: string
}

/// The ASCII code of the character `'0'`.
const char_zero = '0'.charCodeAt(0)

/// The ASCII code of the character `'9'`.
const char_nine = '9'.charCodeAt(0)

/** Using a predicate, check if two arrays are equal */
function ArraysEqual<T, U>(ts: T[], us: U[], predicate: (t: T, u: U) => boolean) {
    if (ts.length !== us.length) return false
    for (let i = 0; i < ts.length; i++)
        if (!predicate(ts[i], us[i]))
            return false
    return true
}

/**
 * Check if an object is of a given type.
 *
 * The object must be of that exact type. This will return
 * `false` if the object is of a subtype of the type.
 */
function is(o: any, type: Function): boolean { return typeof o === 'object' && o && o.constructor === type }

/** Check if a character is between `'0'` and `'9'`. */
function isdigit(char: string): boolean {
    let c = char.charCodeAt(0)
    return c >= char_zero && c <= char_nine
}

/** Clamp a number **/
function clamp(x: number, lo: number, hi: number): number {
    return Math.min(Math.max(x, lo), hi)
}

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

/** Generate a random integer in `[from;to[`. */
function random(from: number, to: number): number {
    return Math.floor(Math.random() * (to - from)) + from
}

/** Remove all child nodes from an element. */
function RemoveAllChildNodes(parent: HTMLElement) {
    while (parent.firstChild) parent.removeChild(parent.firstChild)
}

/** Randomise the order of elements in an array in place. */
function shuffle<T>(array: T[]): T[] {
    if (array.length < 2) return array;
    for (let i = array.length - 1; i > 0; i--) {
        let j = random(0, i)
        let k = array[i]
        array[i] = array[j]
        array[j] = k
    }
    return array;
}

/** Create a Blob from a string */
function StringToBlob(str: string, mime_type: string = "application/json"): Blob {
    return new Blob([str], {type: mime_type})
}

/** Create a Blob from a string */
function StringToObjectURL(str: string): string {
    return URL.createObjectURL(StringToBlob(str))
}

/** Prompt the user to download a file.
 *
 * @param filename The name that the file should have.
 * @param url The URL of the file.
 * */
function DownloadURL(filename: string, url: string) {
    let a = document.createElement('a')
    a.setAttribute('href', url)
    a.setAttribute('download', filename)
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    a.remove()
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

/** Prompt the user for an image src to use for an <img>. */
function GetImage(img: HTMLImageElement) {
    Dialog.file('Select an image', {
        preserve_extern_urls: true,
        description: '<p>You can input a local file or a public url.</p><p>The image can be in any format your browser supports.</p>',
        type: FileType.RAW
    }).and(res => img.src = res.url)
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

/** Remove all characters from the setup screen. */
function RemoveAllCharacters() {
    ;[...document.getElementsByClassName('game-character')].forEach(x => x.remove())
    player_count = 0
}

/// ====================================================================== ///
///  Configuration and Versioning                                          ///
/// ====================================================================== ///
namespace Configuration {
    interface MaybeConfig {version?: number}
    interface StoredURL {url: string}
    interface StoredBlob {data: string}

    /// Legacy (unversioned) configuration.
    namespace Legacy {
        /// An event in a legacy config file.
        export interface StoredEvent {
            message: string,
            players_involved: number,
            fatalities: number[],
            killers: number[],
            enabled: boolean,
            id: number,
            type: string
        }

        /** The options passed to the `Tribute` constructor. */
        interface StoredTributeOptions {
            name: string
            gender_select: string
            custom_pronouns: string
            image?: string
        }

        export type CharacterConfig = { characters: StoredTributeOptions[] }

        export type Config = EventList<StoredEvent>

        /** Check whether a configuration is a legacy configuration. */
        export function is(conf: any): conf is Config { return !conf || !('version' in conf) }

        /** Check whether a configuration is a legacy character configuration. */
        export function CharacterConfigP(conf: any): conf is CharacterConfig { return !conf || !('version' in conf) }

        /** Check whether two events are to be considered equal */
        export function EventsEqual(stored: StoredEvent, event: Event) {
            return stored && event && stored.message === event.message
        }

        /** Load an event from StoredEvent. */
        export function LoadEvent(stored: StoredEvent, list: Event[]) {
            let event = new Event(stored.message, stored.fatalities, stored.killers, stored.type)
            event.enabled = stored.enabled
            list.push(event)
        }

        /** Load characters from a file. **/
        export async function LoadCharacters(data: CharacterConfig) {
            const saved_characters = data.characters

            saved_characters.forEach(c => AddCharacter());
            const characters = document.getElementsByClassName('game-character')

            for (let i = 0; i < characters.length; i++) {
                const character = characters.item(i) as HTMLElement
                const select = character.getElementsByClassName('gender-select')[0] as HTMLSelectElement
                const name = character.getElementsByClassName('character-name')[0] as HTMLInputElement
                const pronouns = character.getElementsByClassName('custom-gender-input')[0] as HTMLInputElement
                const saved = saved_characters[i];

                select.value = saved.gender_select;
                name.value = saved.name
                pronouns.value = saved.custom_pronouns
                if (typeof saved.image === 'string') {
                    /// Load the image from a URL if it’s not a blob. Old versions of the simulator
                    /// would produce URLs ending in ‘[object%20Object]’ for some reason. Ignore those.
                    if (!saved.image.startsWith('blob:') && !saved.image.endsWith('[object%20Object]')) {
                        const img = character.getElementsByClassName('tribute-image')[0] as HTMLImageElement
                        img.src = saved.image
                    }
                }

                /// @ts-ignore
                let input = select.parentElement.parentElement.getElementsByClassName('custom-gender-input-wrapper')[0] as HTMLElement
                input.style.display = (select.value === 'other' ? 'flex' : 'none')
            }
        }
    } /// namespace Legacy

    /// Configuration version 1
    export namespace V1 {
        /// Tag info as stored in a config file.
        export interface StoredTag {name: string}

        export interface StoredTagRequirement {
            name: string,
            player_index: number
        }

        /// An event in a V1 config file.
        export interface StoredEvent {
            message: string,
            fatalities: number[],
            killers: number[],
            enabled: boolean,
            type: string,
            tag_requirements: StoredTagRequirement[]
        }

        export interface Config {
            readonly version: 1
            events: EventList<StoredEvent>
            tags: StoredTag[]
        }

        export type StoredTributeImage = StoredURL | StoredBlob
        export interface StoredTributeOptions {
            name: string
            gender_select: string
            pronoun_str: string
            image?: StoredTributeImage
            tags: Tag[]
        }

        export interface CharacterConfig {
            readonly version: 1
            characters: StoredTributeOptions[]
        }

        export const enum StoredEventTag {
            BigLang = 'BIG LANG'
        }

        /** Check whether a configuration is a legacy configuration. */
        export function is(conf: any): conf is Config { return conf && conf.version === 1 }

        /** Check whether a configuration is a legacy character configuration. */
        export function CharacterConfigP(conf: any): conf is CharacterConfig { return conf && conf.version === 1 }

        /** Check whether two events are to be considered equal */
        export function EventsEqual(stored: StoredEvent, event: Event) {
            return stored !== null && event !== null
                && stored.message === event.message
                && ArraysEqual(stored.tag_requirements, event.requirements,
                    (s, e) => s.name === e.tag.name && s.player_index === e.player_index)
        }

        /** Load an event from StoredEvent. */
        export function LoadEvent(stored: StoredEvent, list: Event[]) {
            let event = new Event(stored.message, stored.fatalities, stored.killers, stored.type)
            event.enabled = stored.enabled && stored.type !== StoredEventTag.BigLang
            stored.tag_requirements.forEach(t => event.require(Tag.for(t.name), t.player_index))
            list.push(event)
        }

        /** Load a tag from a TagInfo struct */
        export function LoadTag(data: StoredTag) { Tag.for(data.name) }

        /** Stringify a tag for the purpose of storing and loading it. */
        export function StringifyTag() {
            /// @ts-ignore
            const info: StoredTag = {name: this.__name}
            return JSON.stringify(info, null, 4)
        }

        /** Check whether a tag already exists.
         *
         * In V1, tags consist of only a name and nothing else. Since
         * LoadTag() calls Tag.for(), which already checks whether a tag
         * already exists, this function can just return true.
         */
        export function TagExists(_: StoredTag) { return true }

        /** Load characters from a file. **/
        export async function LoadCharacters(data: CharacterConfig) {
            const saved_characters = data.characters

            saved_characters.forEach(c => AddCharacter());
            const characters = document.getElementsByClassName('game-character')

            for (let i = 0; i < characters.length; i++) {
                const character = characters.item(i) as HTMLElement
                const select = character.getElementsByClassName('gender-select')[0] as HTMLSelectElement
                const name = character.getElementsByClassName('character-name')[0] as HTMLInputElement
                const pronouns = character.getElementsByClassName('custom-gender-input')[0] as HTMLInputElement
                const saved = saved_characters[i];

                select.value = saved.gender_select;
                name.value = saved.name
                pronouns.value = saved.pronoun_str
                if (typeof saved.image === 'object') {
                    const img = character.getElementsByClassName('tribute-image')[0] as HTMLImageElement

                    /// Image is a URL.
                    if ('url' in saved.image) {
                        /// Can’t load blob URLs, so don’t try. Old versions of the simulator would also
                        /// produce URLs ending in ‘[object%20Object]’ for some reason. Ignore those.
                        if (!saved.image.url.startsWith('blob:') && !saved.image.url.endsWith('[object%20Object]')) {
                            img.src = saved.image.url
                        }
                    }

                    /// Image is a base-64 encoded data URL.
                    else {
                        const blob = await fetch(saved.image.data).then(r => r.blob())
                        img.src = URL.createObjectURL(blob)
                    }
                }

                /// @ts-ignore
                let input = select.parentElement.parentElement.getElementsByClassName('custom-gender-input-wrapper')[0] as HTMLElement
                input.style.display = (select.value === 'other' ? 'flex' : 'none')
            }
        }
    } /// namespace V1

    type EventComparator<T> = (t: T, e: Event) => boolean
    type EventLoader<T> = (t: T, e: Event[]) => void
    type TagExistsP<T> = (t: T) => boolean
    type TagLoader<T> = (t: T) => void

    export const current_config_version = 1
    export let default_config: V1.Config;

    /** Check if an event exists */
    function EventExists<T>(conf_event: T, equalp: EventComparator<T>): boolean {
        for (const event of Game.events())
            if (equalp(conf_event, event))
                return true;
        return false;
    }

    /** Load the events from the configuration. */
    function LoadEvents<T>(lists: EventList<T>, equalp: EventComparator<T>, loader: EventLoader<T>) {
        for (const key of Event.list_keys) {
            /// Add the events.
            /// @ts-ignore
            const list = lists[key] as T[]
            list.filter(e => !EventExists(e, equalp))
                /// @ts-ignore
                .forEach(e => loader(e, Game.event_lists[key]))
        }
    }

    function LoadTags<T>(tags: T[], existsp: TagExistsP<T>, loader: TagLoader<T>) {
        tags.filter(t => !existsp(t))
            .forEach(t => loader(t))
    }

    /** Load a configuration. */
    export function Load(configuration: MaybeConfig, overwrite: boolean = false, from_local_storage = false) {
        /// Legacy file format.
        if (Legacy.is(configuration)) {
            if (overwrite)
                for (const key of Event.list_keys)
                    /// @ts-ignore
                    Game.event_lists[key] = []

            LoadEvents(configuration, Legacy.EventsEqual, Legacy.LoadEvent)
        }

        /// Versioned file format.
        else if (V1.is(configuration)) {
            if (overwrite) {
                /// @ts-ignore
                for (const key of Event.list_keys) Game.event_lists[key] = []
                Tag.registered_tags = []
            }

            LoadTags(configuration.tags, V1.TagExists, V1.LoadTag)
            LoadEvents(configuration.events, V1.EventsEqual, V1.LoadEvent)
        }

        /// Invalid Configuration. If we're loading from localStorage, just ignore it.
        else if (!from_local_storage) throw Error(`Invalid config version ${configuration.version}`)
    }

    /** Load the default configuration. */
    export function LoadDefaultConfig() { Load(Configuration.default_config, true) }

    /** Create an object containing the events data to store. */
    function SaveEvents(): EventList<V1.StoredEvent> {
        let lists: EventList<V1.StoredEvent> = {
            all: [],
            bloodbath: [],
            day: [],
            feast: [],
            night: [],
        }

        for (const key of Event.list_keys) {
            /// @ts-ignore
            const list = Game.event_lists[key] as Event[]
            /// @ts-ignore
            const stored_list = lists[key] as V1.StoredEvent[]

            for (const e of list) {
                /// Copy the event data.
                let stored_event: V1.StoredEvent = {
                    message: e.message,
                    fatalities: e.fatalities,
                    killers: e.killers,
                    enabled: e.enabled,
                    type: e.type,
                    tag_requirements: []
                }

                /// Store the requirements.
                for (const req of e.requirements)
                    stored_event.tag_requirements.push({player_index: req.player_index, name: req.tag.name})

                /// Add the events to the lists to store.
                stored_list.push(stored_event)
            }
        }

        return lists
    }

    /** Create an object containing the tag data to store. */
    function SaveTags(): V1.StoredTag[] {
        let tags: V1.StoredTag[] = []
        for (const tag of Tag.registered_tags) tags.push({name: tag.name})
        return tags
    }

    /** Save the configuration. */
    export function Save(): V1.Config {
        return {
            version: current_config_version,
            events: SaveEvents(),
            tags: SaveTags()
        }
    }

    /** Like the Event constructor, but creates a stored event instead. */
    export function MakeStoredEvent(message: string, fatalities: number[] = [], killers: number[] = [],
                                    type: string = "BUILTIN", reqs: V1.StoredTagRequirement[] = []): V1.StoredEvent {
        return {
            message,
            fatalities,
            killers,
            type,
            enabled: true,
            tag_requirements: reqs
        }
    }

    /** Save characters to a file. **/
    export async function SaveCharacters(to_local_storage: boolean = false): Promise<V1.CharacterConfig> {
        /// Serialise Tributes.
        let config: V1.CharacterConfig = {
            version: current_config_version,
            characters: []
        }

        let lasterr
        for (let character of document.getElementsByClassName('game-character')) {
            try {
                /// Image.
                let image_src: string = (<HTMLImageElement>character.getElementsByClassName('tribute-image')[0]).src?.trim()
                let image: V1.StoredTributeImage | undefined = undefined

                /// Image is a blob. Base-64 encode it.
                if (image_src.startsWith('blob:')) {
                    const blob = await fetch(image_src).then(r => r.blob())
                    const reader = new FileReader()
                    reader.readAsDataURL(blob)
                    image = {data: await new Promise<string>(resolve => reader.onloadend = () => resolve(reader.result as string))}
                }

                /// Image is a URL.
                else if (image !== '') image = {url: image_src}

                /// Name and gender_select value.
                const name = (<HTMLInputElement>character.getElementsByClassName('character-name')[0]).value.trim()
                const gender_select = (<HTMLInputElement>character.getElementsByClassName('gender-select')[0]).value

                /// Pronouns.
                const pronoun_str = (<HTMLInputElement>character.getElementsByClassName('custom-gender-input')[0]).value.trim()

                /// Save the character.
                config.characters.push({
                    name: name,
                    gender_select: gender_select,
                    pronoun_str: pronoun_str,
                    image: image,
                    tags: [],
                })
            } catch (e) {
                lasterr = e
            }
        }

        if (lasterr && !to_local_storage) Dialog.error(`Error saving characters: ${lasterr}. Some characters may not have been saved correctly.`)
        return config
    }

    /** Load characters from a file. **/
    export async function LoadCharacters(data: object, from_local_storage: boolean = false) {
        RemoveAllCharacters()
        if (Legacy.CharacterConfigP(data)) await Legacy.LoadCharacters(data);
        else if (V1.CharacterConfigP(data)) await V1.LoadCharacters(data);
        else if (!from_local_storage) throw Error(`Invalid character configuration file`)
    }

    /** Default Characters **/
    export function LoadDefaultCharacters() {
        RemoveAllCharacters()
        AddCharacter();
        AddCharacter();
    }
} /// namespace Configuration

/// ====================================================================== ///
///  Tags                                                                  ///
/// ====================================================================== ///

class Tag {
    static __next_id = 0

    /// All known tags. The id of a tag is an index into this array.
    static registered_tags: Tag[] = []

    /// Index of the tag in the tag list.
    readonly id: number

    /// The actual name of the tag.
    ///
    /// This is one of the few times where a getter/setter
    /// is required since we don't allow two different tags
    /// with the same name
    __name: string
    get name(): string { return this.__name }
    set name(name: string) {
        for (const {__name} of Tag.registered_tags)
            if (name == __name)
                throw Error(`A tag with the name ${name} already exists`)
        this.__name = name
    }

    /** Creates an new tag. You probably want to use Tag.for() instead. */
    constructor(name: string) {
        this.id = Tag.__next_id++
        this.__name = name
        Tag.registered_tags.push(this)
    }

    /** Check if this tag is the same as another tag. */
    __equal(b: Tag) { return this.id == b.id }

    /**
     * When serialised, a tag be represented by its name only.
     * The tags themselves are stored separately.
     */
    toJSON() { return this.__name }

    /** Check if two tags are equal. */
    static equal(a: Tag | null | undefined, b: Tag | null | undefined) {
        if (!(a instanceof Tag) || !(b instanceof Tag)) return false
        if (!is(a, b.constructor)) return false
        return a.__equal(b)
    }

    /** Create a named tag for a given string. */
    static for(name: string): Tag { return Tag.registered_tags.find(t => t.name == name) ?? new Tag(name) }

    /** Dump all tags as JSON */
    static toJSON() { return this.registered_tags }
}

/// ====================================================================== ///
///  Tributes                                                              ///
/// ====================================================================== ///

/** The N/A/G/R pronouns used by a tribute. */
interface TributePronouns {
    nominative?: string
    accusative?: string
    genitive?: string
    reflexive?: string
}

/** The options passed to the `Tribute` constructor. */
interface TributeOptions {
    uses_pronouns: boolean
    pronouns: TributePronouns
    plural: boolean
    image: string
    tags?: Tag[]
}

/** A tribute in game or on the character selection screen. */
class Tribute {
    raw_name: string
    pronouns: TributePronouns
    uses_pronouns: boolean
    image_src: string
    plural: boolean
    kills: number
    died_in_round: number
    __tags: Tag[]

    constructor(name: string, options: TributeOptions) {
        this.raw_name = name
        this.pronouns = {}
        this.uses_pronouns = options.uses_pronouns ?? true
        if (this.uses_pronouns) this.pronouns = {...options.pronouns}
        this.image_src = options.image ?? ''
        this.plural = options.plural ?? false
        this.kills = 0
        this.died_in_round = 0
        this.__tags = []
        if (options.tags) this.__tags.push(...options.tags)
    }

    /** Check whether this tribute has a given tag. */
    has(t: Tag): boolean {
        for (const tag of this.__tags)
            if (Tag.equal(tag, t))
                return true
        return false
    }

    get name() { return `<span class="tribute-name">${this.raw_name}</span>` }
    get image() { return `<img class="tribute-image" alt="${this.raw_name}" src="${this.image_src}"></img>` }

    /** Add a tag to this tribute. */
    tag(t: Tag): void { if (!this.has(t)) this.__tags.push(t) }
}

/**
 * Parse a pronoun string into a TributePronouns object.
 * @throw UserError if the string is invalid.
 */
function ParsePronounsFromCharacterCreation(character: Element): { pronouns?: TributePronouns, uses_pronouns: boolean, plural: boolean } {
    let option = (<HTMLInputElement>character.getElementsByClassName('gender-select')[0]).value

    let plural = false
    let uses_pronouns = true
    let tribute_pronouns: TributePronouns | undefined = undefined

    let pronoun_str
    switch (option) {
        case 'm':
            pronoun_str = 'he/him/his/himself'
            break
        case 'f':
            pronoun_str = 'she/her/her/herself'
            break
        case 'c':
            pronoun_str = 'they/them/their/themself'
            plural = true
            break
        case 'n':
            uses_pronouns = false
            break
        case 'other':
            pronoun_str = (<HTMLInputElement>character.getElementsByClassName('custom-gender-input')[0]).value.trim()
            pronoun_str = pronoun_str.replaceAll('//', '\x1f')
            if (!pronoun_str.match(/.+\/.+\/.+\/.+/)) throw new UserError('Custom pronouns must be of the form <code>nom/acc/gen/reflx</code>. Example: <code>they/them/their/themself</code>.')
            break
        default:
            throw new UserError('Game character pronoun selection has invalid state');
    }

    if (uses_pronouns) {
        /// @ts-ignore
        let pronouns: string[] = pronoun_str.split('/').map(x => x.replaceAll('\x1f', '//').trim())
        if (pronouns.includes('')) throw new UserError('Custom pronouns may not be empty! You have to specify at least one non-whitespace character for each pronoun.')
        tribute_pronouns = {
            nominative: pronouns[0],
            accusative: pronouns[1],
            genitive: pronouns[2],
            reflexive: pronouns[3]
        }
    }

    return {pronouns: tribute_pronouns, uses_pronouns, plural}
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

    /** Download the current characters as a JSON file. */
    export async function SaveCharacters() {
        const chars = await Configuration.SaveCharacters();
        DownloadURL('characters.json', URL.createObjectURL(new Blob([JSON.stringify(chars, null, 4)], {type: 'application/json'})))
    }

    /** Load characters from a file. */
    export async function LoadCharacters() {
        Dialog.file('Load Game Setup', {
            description: '<p>Click below to upload a save.</p><p>This will override the current setup. Unsaved changes will be lost!</p>',
            type: FileType.JSON,
        }).and(async res => {
            try {
                await Configuration.LoadCharacters(res.data as object);
            } catch (e) {
                /// @ts-ignore
                Dialog.error(e)
            }
        })
    }
} /// namespace UI

/**
 * Generate a message describing an event based on the event's message template and the tributes involved.
 *
 * @param event A `GameEvent` (NOT `Event`) for which we want to construct the message.
 * @return The formatted event message.
 */
function ComposeEventMessage(event: GameEvent): string {
    /// Determine whether there is a tribute w/ index `index`.
    function check_bounds(event: GameEvent, index: number): boolean {
        if (index >= event.event.players_involved) {
            Dialog.error(`Index out of bounds.<br><br>Cannot substitute player "${index}" in event 
                <code style='color: var(--accentlight);'>"${event.event.message}"</code> since it only involves ${event.event.players_involved} player${event.event.players_involved > 1 ? 's' : ''}.<br><br>
                Keep in mind that the first player's formatting code is "%0", and so on.`)
            return false
        }
        return true
    }

    let m = event.event.message
    let composed = ''
    let prev = 0, i = 0
    outer:
        for (; ;) {
            while (i < m.length && m[i] !== '%') i++
            composed += m.slice(prev, i)
            prev = i
            if (i >= m.length) break
            i++ /// yeet %
            if (i >= m.length) break

            switch (m[i]) {
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9': {
                    if (check_bounds(event, m[i].charCodeAt(0) - char_zero)) {
                        let name = event.players_involved[m[i].charCodeAt(0) - char_zero].name
                        composed += name
                    } else composed += "(error)"

                    i++
                    if (i >= m.length) break outer; /// yeet %
                    break;
                }
                case 'N':
                case 'A':
                case 'G':
                case 'R':
                case 's':
                case 'y':
                case 'i':
                case 'h':
                case 'e':
                case '!': {
                    let c = m[i++];
                    if (isdigit(m[i])) {
                        let index = m[i].charCodeAt(0) - char_zero
                        let text
                        if (check_bounds(event, index)) {
                            let tribute = event.players_involved[index]
                            switch (c) {
                                // Pronouns
                                case 'N': text = tribute.uses_pronouns ? tribute.pronouns.nominative : tribute.name; break
                                case 'A': text = tribute.uses_pronouns ? tribute.pronouns.accusative : tribute.name; break
                                case 'G': text = tribute.uses_pronouns ? tribute.pronouns.genitive : tribute.name + '’s'; break
                                case 'R': text = tribute.uses_pronouns ? tribute.pronouns.reflexive : tribute.name; break

                                // Singular/plural specifiers.
                                case 'e': text = tribute.plural ? '' : 'es'; break            // 3SG        / -es
                                case 's': text = tribute.plural ? '' : 's'; break             // 3SG        / -s
                                case 'y': text = tribute.plural ? 'y' : 'ies'; break          // 3SG -y     / -ies
                                case 'i': text = tribute.plural ? 'are' : 'is'; break         // 3SG are    / is
                                case 'h': text = tribute.plural ? 'have' : 'has'; break       // 3SG have   / has
                                case '!': text = tribute.plural ? 'aren\'t' : 'isn\'t'; break // 3SG aren't / isn't
                                default: continue
                            }
                            composed += text
                        } else composed += "(error)"
                        i++
                    } else continue;
                    break;
                }
                default:
                    continue;
            }
            prev = i;
        }
    if (prev < m.length) composed += m.slice(prev)
    return composed
}

/** Calculate the number of tributes required based on the message template. */
function CalculateTributesInvolved(raw_message: string): number {
    const v_raw = raw_message.match(/%[NAGRsyih!]?(\d)/g)
        ?.map(x => +x.slice(-1))
        ?.reduce((prev, curr) => Math.max(prev, curr), 0)
    const value = typeof v_raw === 'undefined' ? 0 : v_raw + 1
    return Number.isFinite(value) ? value : 0
}

/** A requirement that must be satisfied for an event to be eligible. */
interface TagRequirement {
    tag: Tag
    player_index: number
}

/** An event in the event list (NOT in game; for that, see `GameEvent`). */
class Event {
    static __last_id = -1
    static readonly list_keys = ['day', 'all', 'feast', 'night', 'bloodbath']

    message: string
    players_involved: number
    fatalities: number[]
    killers: number[]
    enabled: boolean
    id: number
    type: string
    requirements: TagRequirement[]

    constructor(message: string, fatalities: number[] = [], killers: number[] = [], type = 'BUILTIN') {
        this.message = message
        this.players_involved = Math.max(CalculateTributesInvolved(message))
        if (this.players_involved < 1 || this.players_involved > 9 || !Number.isFinite(this.players_involved))
            throw Error(`Event '${message}' is ill-formed since it would involve ${this.players_involved} players`)
        if (Math.max(...fatalities) > this.players_involved)
            throw Error(`Invalid fatalities '${fatalities.toString()}' for event since it only involves ${this.players_involved} players`)
        if (Math.max(...killers) > this.players_involved)
            throw Error(`Invalid killers '${killers.toString()}' for event since it only involves ${this.players_involved} players`)
        this.fatalities = fatalities
        this.killers = killers
        this.enabled = true
        this.id = ++Event.__last_id
        this.type = type
        this.requirements = []
    }

    /** Add a requirement to this event */
    require(tag: Tag, player_index: number): this {
        if (player_index >= this.players_involved)
            throw Error(`Cannot add requirement for player ${player_index} since the event only involves ${this.players_involved} players`)

        /// Make sure to not add the same requirement twice.
        if (!this.requirements.find(r => r.tag == tag && r.player_index == player_index)) this.requirements.push({
            tag,
            player_index
        })
        return this
    }
}

/** Shadow root of the events dialog. */
interface EventsShadowRoot extends ShadowRoot {
    events_changed_map: Map<string, boolean>
}

/// ====================================================================== ///
///  Game                                                                  ///
/// ====================================================================== ///

/** The state of the game. This corresponds loosely to the screen being displayed. */
enum GameState {
    DEAD,
    INITIAL,
    ROUND_PART_1,
    ROUND_PART_2,
    ROUND_RESULTS,
    END_RESULTS,
    END_WINNER,
    END_NO_WINNER,
    END_SUMMARY_FATALITIES,
    END_SUMMARY_STATS,
    END,
}

/** These correspond to the event lists. */
enum GameStage {
    BLOODBATH = 'bloodbath',
    DAY = 'day',
    NIGHT = 'night',
    FEAST = 'feast'
}

/** An in-game event. */
class GameEvent {
    event: Event
    players_involved: Tribute[]
    message: string

    constructor(event: any, players_involved: any) {
        this.event = event
        this.players_involved = players_involved
        this.message = ComposeEventMessage(this)
    }
}

/** The event list holding all the events in the game. */
interface GameEventList {
    bloodbath: Event[],
    day: Event[],
    night: Event[],
    feast: Event[]
}

/** An event list that may contain events for different stages. */
interface EventList<T = Event> {
    bloodbath?: T[],
    day?: T[],
    night?: T[],
    feast?: T[]
    all?: T[]
}

/** A single round in the game. */
interface GameRound {
    game_events: GameEvent[],
    tributes_dead: Tribute[],
    number: number,
    stage: GameStage
}

/** This class holds the state for an ongoing game. */
class Game {
    /// These are mostly used outside of this module.
    static Tribute = Tribute
    static Event = Event
    static UI = UI
    static event_lists: EventList = {bloodbath: [], day: [], night: [], feast: [], all: []}
    static active_game_instance: Game | null

    tributes: Tribute[]
    tributes_alive: Tribute[]
    tributes_dead: Tribute[]
    tributes_died: Tribute[]
    round: number
    /// @ts-ignore
    last_round: GameRound
    last_feast: number
    state: GameState
    stage: GameStage
    exceptions: number
    fatality_reroll_rate: number
    all_won: boolean
    rounds: GameRound[]
    days_passed: number
    nights_passed: number
    events: GameEventList
    required_fatalities: number | undefined

    constructor(tributes: any, options?: any) {
        this.tributes = Array.of(...tributes)
        this.tributes_alive = tributes
        this.tributes_dead = []
        this.tributes_died = []
        this.round = 1
        this.last_feast = 1
        this.state = GameState.INITIAL
        this.stage = GameStage.BLOODBATH
        this.exceptions = 0
        this.fatality_reroll_rate = options?.fatality_reroll_rate ?? .60
        this.all_won = false
        this.rounds = []
        this.days_passed = 0
        this.nights_passed = 0
        this.required_fatalities = undefined

        /// Set required fatality rate.
        if (settings_fatalities_mode.value !== SettingsFatalitiesMode.Disable) {
            const value = parseInt(settings_fatalities_value.value.replaceAll('%', '').trim(), 10)
            if (isFinite(value)) {
                /// Relative to the total number of tributes.
                if (settings_fatalities_mode.value === SettingsFatalitiesMode.Percent)
                    this.required_fatalities = Math.ceil((clamp(value, 0, 100) / 100.0) * this.tributes.length)

                /// Absolute
                else this.required_fatalities = Math.max(0, value)

                /// Shouldn’t ever happen, but still.
                if (!isFinite(this.required_fatalities as number)) this.required_fatalities = undefined
            }
        }

        this.events = {
            bloodbath: [],
            day: [],
            night: [],
            feast: []
        }

        this.AddEvents(Game.event_lists)
    }

    /** Add all events from an event list to the game. */
    AddEvents(event_option_list: EventList) {
        if (event_option_list.all) {
            for (let event_list of [this.events.bloodbath, this.events.day, this.events.night, this.events.feast])
                event_list.push(...event_option_list.all.filter(e => e.enabled))
        }

        for (let property of [GameStage.BLOODBATH, GameStage.DAY, GameStage.NIGHT, GameStage.FEAST])
            if (event_option_list[property])
                this.events[property].push(...(<Event[]>event_option_list[property]).filter(e => e.enabled))
    }

    /** Determine what the next game stage should be and set it. */
    NextGameStage() {
        /// Start of game is always STAGE_BLOODBATH
        if (this.round === 1) {
            this.stage = GameStage.BLOODBATH
            return
        }

        if (this.stage === GameStage.FEAST || this.stage === GameStage.BLOODBATH) {
            this.days_passed++
            this.stage = GameStage.DAY
            return
        }

        if (this.stage === GameStage.NIGHT) {
            /// Feast can occur before Day once every 5+ as follows
            /// 5 rounds: 25% chance
            /// 6 rounds: 33% chance
            /// 7+ rounds: 50% chance

            let rounds_since_feast = this.round - this.last_feast;

            if (rounds_since_feast >= 5) block: {
                if (rounds_since_feast >= 7) {
                    if (Math.random() > .50 * (rounds_since_feast - 4)) break block
                } else if (rounds_since_feast >= 6) {
                    if (Math.random() > .33 * (rounds_since_feast - 4)) break block
                } else {
                    if (Math.random() > .25 * (rounds_since_feast - 4)) break block
                }

                this.last_feast = this.round;
                this.stage = GameStage.FEAST
                return
            }

            /// Otherwise, it's Day
            this.days_passed++
            this.stage = GameStage.DAY
            return
        }

        this.nights_passed++
        this.stage = GameStage.NIGHT
    }

    /** Initialise 10 players on the character selection screen for debugging. */
    static PrepareDebugGame(players = 10) {
        RemoveAllCharacters()
        for (let i = 0; i < players; i++) AddCharacterFromImage(default_image_src, `Player${i}`)
    }

    /** Run a full game for debugging. */
    static RunDebugGame(times = 1) {
        while (times--) {
            this.PrepareDebugGame()
            this.CreateGame()
            while (this.active_game_instance) this.active_game_instance.AdvanceGame()
        }
    }

    /**
     * Check requirements for an event.
     *
     * There are several restrictions as to what events we can use
     * at any given point in time.
     */
    RequirementsSatisfied(event: Event, current_tribute: number, tributes_left: number, died_this_round: number): boolean {
        /// An event must not involve more players than are left.
        if (event.players_involved > tributes_left) return false

        /// If there is a required number of fatalities, we want to drive
        /// the number of fatalities higher. If we’ve already achieved the
        /// required number of fatalities, we don’t want any more fatalities.
        if (this.required_fatalities) {
            if (died_this_round < this.required_fatalities && !event.fatalities.length) return false
            if (died_this_round >= this.required_fatalities && event.fatalities.length) return false
        }

        /// Otherwise, if an event has fatalities, we might want to do the opposite and
        /// reroll it depending on the fatality_reroll_rate and whether we’ve already
        /// achieved the required number of fatalities.
        else if (event.fatalities.length && Math.random() < this.fatality_reroll_rate) return false

        /// If an event has tag requirements, it can only be chosen if the players fit those requirements.
        for (const {tag, player_index} of event.requirements)
            if (!this.tributes_alive[current_tribute + player_index].has(tag))
                return false;

        /// Otherwise this event is fine.
        return true;
    }

    /**
     * Perform the next round.
     *
     * This keeps choosing events randomly until all characters
     * have acted in an event.
     */
    NextRound(): GameRound {
        /// Get the number of tributes
        let tributes_left = this.tributes_alive.length
        let tributes_alive = tributes_left
        let current_tribute = 0

        /// Get the appropriate game stage.
        this.NextGameStage()

        let round = {
            game_events: [],
            tributes_dead: [],
            number: this.round,
            stage: this.stage
        } as GameRound

        /// Shuffle the tributes to randomise the encounters.
        shuffle(this.tributes_alive)

        let event_list: Event[]
        switch (this.stage) {
            case GameStage.BLOODBATH:
                event_list = this.events.bloodbath
                break
            default:
                console.error(`Unsupported stage '${this.stage}'`)
            /// fallthrough
            case GameStage.DAY:
                event_list = this.events.day
                break
            case GameStage.NIGHT:
                event_list = this.events.night
                break
            case GameStage.FEAST:
                event_list = this.events.feast
                break
        }

        /// If the list contains no events, then there's nothing to do.
        if (!event_list?.length) return round
        let died_this_round = 0

        /// Randomly pick an event from the corresponding event list
        /// whose number of tributes involved does not exceed the number
        /// of tributes left. Ensure that every tribute is only picked once.
        /// Repeat until no tributes are left.
        while (tributes_left) {
            let tributes_involved: Tribute[] = []
            let event: Event

            /// Choose an event at random. Make sure we don't fall into an infinite loop.
            let tries = 0
            do {
                if (tries++ > Math.max(100, event_list.length * 10)) return round
                event = event_list[random(0, event_list.length)]
            } while (!this.RequirementsSatisfied(event, current_tribute, tributes_left, died_this_round))
            tributes_left -= event.players_involved

            /// Handle fatalities.
            for (const f of event.fatalities) {
                this.tributes_alive[current_tribute + f].died_in_round = this.round
                round.tributes_dead.push(this.tributes_alive[current_tribute + f])
                tributes_alive--
                died_this_round++
            }

            for (const k of event.killers) this.tributes_alive[current_tribute + k].kills += event.fatalities.length

            /// Add all players affected to the event.
            let last = current_tribute + event.players_involved
            for (; current_tribute < last; current_tribute++) tributes_involved.push(this.tributes_alive[current_tribute])

            round.game_events.push(new GameEvent(event, tributes_involved))
            if (tributes_alive < 2) break
        }

        /// If the user set a fixed number of deaths to happen each round, then all
        /// of them will be at the start of the list since we first ensure that we
        /// have the required amount. That’s fine, but we should shuffle them after
        /// the fact so all the deaths don’t end up displayed at the top since that
        /// can make things a bit anticlimactic.
        shuffle(round.game_events)
        return round;
    }

    /** Try to perform the next round. Report an error to the user if something goes wrong. */
    SecureDoRound(): GameRound {
        try { return this.NextRound() } catch (e) {
            /// @ts-ignore
            Dialog.error(FormatError(e))
            console.log(e)
            console.log('Game State:', this)
            throw e
        }
    }

    /** Display the events of the current round to the user. */
    DisplayRoundEvents() {
        if (this.stage === GameStage.DAY) game_title.innerHTML = `Day ${this.days_passed}`
        else if (this.stage === GameStage.NIGHT) game_title.innerHTML = `Night ${this.nights_passed}`
        else game_title.innerHTML = this.stage.slice(0, 1).toUpperCase() + this.stage.slice(1)

        DisplayMessages(this.last_round.game_events, event_message_template, (event, message) => {
            let image_wrapper = message.getElementsByClassName('event-message-images')[0]
            for (const tribute of event.players_involved) image_wrapper.innerHTML += `<div class="image-wrapper">${tribute.image}</div>`
            message.getElementsByClassName('event-message')[0].innerHTML = event.message
        })

        for (const tribute of this.last_round.tributes_dead) {
            this.tributes_alive.splice(this.tributes_alive.indexOf(tribute), 1)
            this.tributes_died.push(tribute)
        }

    }

    /** Display the tributes just died this round. */
    DisplayRoundFatalities() {
        game_title.innerHTML = 'The Fallen'

        if (this.tributes_died.length) {
            DisplayMessages(this.tributes_died, death_message_template, (tribute, message) => {
                message.getElementsByClassName('death-message-image')[0].innerHTML += tribute.image
                message.getElementsByClassName('death-message')[0].innerHTML = tribute.name + ' has died this round'
            })
            DisplayBefore(`${this.tributes_died.length} cannon shot${this.tributes_died.length === 1 ? '' : 's'} can be heard in the distance.`)
            this.tributes_dead.push(...this.tributes_died)
        } else {
            RemoveAllChildNodes(game_content)
            DisplayBefore('No cannon shots can be heard in the distance.')
        }

        this.tributes_died = []
    }

    /** Display the winners after the game has ended. */
    DisplayWinners() {
        game_title.innerHTML = 'The Games have ended'

        ClearMessages()
        game_content.appendChild(event_message_template.cloneNode(true))
        let message = game_content.children[0]

        for (const tribute of this.tributes_alive)
            message.getElementsByClassName('event-message-images')[0].innerHTML += `<div class="image-wrapper">${tribute.image}</div>`

        let text

        if (this.tributes_alive.length === 1) text = `The winner is ${this.tributes_alive[0].name}!`
        else if (this.tributes_alive.length === 2) text = `The winners are ${this.tributes_alive[0].name} and ${this.tributes_alive[1].name}`
        else {
            text = 'The winners are '
            let i = 0
            for (; i < this.tributes_alive.length - 1; i++) text += `${this.tributes_alive[i].name}, `
            text += `and ${this.tributes_alive[i].name}!`
        }

        message.getElementsByClassName('event-message')[0].innerHTML = text
    }

    /** Display a screen indicating that everyone is dead. */
    DisplayNoWinner() {
        game_title.innerHTML = 'The Games have ended'

        ClearMessages()
        game_content.appendChild(event_message_template.cloneNode(true))
        let message = game_content.children[0]

        message.getElementsByClassName('event-message')[0].innerHTML = 'There are no survivors.'
    }

    /** Display a summary of who died in what round. */
    DisplayFinalFatalities() {
        game_title.innerHTML = 'Deaths'

        DisplayMessages(this.rounds, game_fatalities_template, (round, message) => {
            message.getElementsByClassName('round-title')[0].innerHTML = `Round ${round.number}: ${round.stage.slice(0, 1).toUpperCase() + round.stage.slice(1)}`
            let fatalities = ''
            for (const event of round.game_events) if (event.event.fatalities.length) fatalities += event.message + '<br>'
            message.getElementsByClassName('round-fatalities')[0].innerHTML = fatalities === '' ? 'No-one died' : fatalities
        })
    }

    /** Display the stat screen at the end of the game. */
    DisplayFinalStats() {
        ClearMessages()
        game_content.classList.add('flex-wrap')
        game_content.appendChild(tribute_stats_wrapper_template.cloneNode(true))

        if (this.tributes_alive.length) {
            game_title.innerHTML = 'Winners'
            let alive_stats = game_content.getElementsByClassName('alive-stats')[0]
            for (const tribute of this.tributes_alive) alive_stats.appendChild(tribute_stats_template.cloneNode(true))
            AppendTributeStatsMessages(alive_stats.children, this.tributes_alive)
        } else {
            game_content.getElementsByClassName('alive-stats-wrapper')[0].remove()
            game_content.getElementsByClassName('tribute-stats-header')[0].remove()
            game_title.innerHTML = 'The Fallen'
        }

        if (this.tributes_dead.length) {
            let dead_stats = game_content.getElementsByClassName('dead-stats')[0]
            for (const tribute of this.tributes_dead) dead_stats.appendChild(tribute_stats_template.cloneNode(true))
            AppendTributeStatsMessages(dead_stats.children, this.tributes_dead.reverse())
        } else game_content.getElementsByClassName('dead-stats-wrapper')[0].remove()
    }

    /** Go back to the setup screen. */
    ReturnToMainMenu() {
        (<HTMLButtonElement>document.getElementById('advance-game')).onclick = null
        ClearMessages()
        create_game.style.display = 'block';
        (<HTMLDivElement>document.getElementById('game')).style.display = 'none'
    }

    /** Determine whether the game should end based on how may tributes are alive or whether all should win. */
    CheckGameShouldEnd() {
        if (this.tributes_alive.length < 2 || this.all_won) {
            this.state = GameState.END_RESULTS
            return true
        }

        return false
    }

    /** The main state machine controlling the game. */
    AdvanceGame() {
        window.scrollTo(0, 0)

        /// Advance the state and perform and action accordingly.
        switch (this.state) {
            case GameState.INITIAL:
            case GameState.ROUND_PART_1: {
                this.last_round = this.SecureDoRound()
                this.DisplayRoundEvents()
                this.rounds.push(this.last_round)
                this.round++

                if (!this.CheckGameShouldEnd())
                    if (this.stage !== GameStage.BLOODBATH && this.stage !== GameStage.FEAST)
                        this.state = GameState.ROUND_PART_2
                break
            }

            case GameState.ROUND_PART_2: {
                this.last_round = this.SecureDoRound()
                this.DisplayRoundEvents()
                this.rounds.push(this.last_round)
                this.round++

                if (!this.CheckGameShouldEnd()) this.state = GameState.ROUND_RESULTS
                break
            }

            case GameState.ROUND_RESULTS: {
                this.DisplayRoundFatalities()
                this.state = GameState.ROUND_PART_1
                break
            }

            case GameState.END_RESULTS: {
                this.DisplayRoundFatalities()
                if (!this.tributes_alive.length) this.state = GameState.END_NO_WINNER
                else this.state = GameState.END_WINNER
                break
            }

            case GameState.END_WINNER: {
                this.DisplayWinners()
                this.state = GameState.END_SUMMARY_FATALITIES
                break
            }

            case GameState.END_NO_WINNER: {
                this.DisplayNoWinner()
                this.state = GameState.END_SUMMARY_FATALITIES
                break
            }

            case GameState.END_SUMMARY_FATALITIES: {
                this.DisplayFinalFatalities()
                this.state = GameState.END_SUMMARY_STATS
                break
            }

            case GameState.END_SUMMARY_STATS: {
                this.DisplayFinalStats()
                this.state = GameState.END
                start_game_button.innerHTML = "End Game"
                break
            }

            case GameState.END: {
                this.ReturnToMainMenu()
                Game.active_game_instance = null
                start_game_button.innerHTML = "Proceed"
                break
            }

            default: {
                Dialog.error('An internal error has occurred; Game.state was ' + this.state)
                console.error('An internal error has occurred; Game.state was ' + this.state)
                this.state = GameState.DEAD
                throw new Error('unreachable')
            }
        }

        /// @ts-ignore
        window.SetOpenImagePreview()
    }

    /** Create a new game from the current setup. */
    static CreateGame() {
        if (Game.active_game_instance) {
            Dialog.error('Cannot start a new game while a game is already running. Reload the page if you want to abort your current game and start a new one.')
            return
        }

        let tributes: Tribute[] = []

        /// Get tributes
        for (let character of document.getElementsByClassName('game-character')) {
            /// Name
            let name = (<HTMLInputElement>character.getElementsByClassName('character-name')[0]).value.trim()
            if (!name) {
                Dialog.error('One or more character names are empty!')
                return
            }

            /// Pronouns & Number
            let pronouns: { pronouns?: TributePronouns, uses_pronouns: boolean, plural: boolean }
            try { pronouns = ParsePronounsFromCharacterCreation(character) } catch (e) {
                /// @ts-ignore
                Dialog.error(e)
                return
            }

            /// Image
            let src = (<HTMLImageElement>character.getElementsByClassName('tribute-image')[0]).src?.trim()

            /// Add the character.
            tributes.push(new Tribute(name, {
                pronouns: pronouns.pronouns ?? {},
                uses_pronouns: pronouns.uses_pronouns,
                plural: pronouns.plural,
                image: src ?? default_image_src,
                tags: []
            }))
        }

        game_content.classList.remove('flex-wrap')

        Game.active_game_instance = new Game(tributes)

        create_game.style.display = 'none';
        (<HTMLDivElement>document.getElementById('game')).style.display = 'block'

        Game.active_game_instance.AdvanceGame();
        (<HTMLButtonElement>document.getElementById('advance-game')).onclick =
            () => (<Game>Game.active_game_instance).AdvanceGame.call(Game.active_game_instance)
    }

    /** Abort the current game and return to the setup screen. */
    static AbortGame() {
        Dialog.confirm('Your progress will be lost. Are you sure you want to abort the game?').and(() => {
            if (!Game.active_game_instance) return
            Game.active_game_instance.state = GameState.END
            Game.active_game_instance.AdvanceGame()
        })
    }

    static events() {
        return {
            * [Symbol.iterator](): Iterator<Event> {
                for (let event_list_name of Object.keys(Game.event_lists))
                    /// @ts-ignore
                    for (let event of Game.event_lists[event_list_name] as Event[])
                        yield event
            }
        }
    }
}

/** Display a message before the game content */
function DisplayBefore(text: string) {
    game_before_content.style.display = 'block'
    game_before_content.innerHTML = text
}

/** Remove all event messages */
function ClearMessages() {
    RemoveAllChildNodes(game_content)
    game_before_content.style.display = 'none'
}

/**
 * Create and display messages.
 *
 * @param collection A collection of objects from which to create the messages.
 * @param template A document fragment that should serve as the template for each message.
 * @param callback A callback that is called on each object in the collection and its corresponding message.
 */
function DisplayMessages<T>(collection: T[], template: DocumentFragment, callback: (T: any, Element: any) => any) {
    ClearMessages()

    for (const element of collection) game_content.appendChild(template.cloneNode(true))
    let messages = game_content.children

    for (const i in collection) {
        let element = collection[i]
        let message = messages[i]

        callback(element, message as HTMLElement)
    }
}

/** Append messages displaying the stats for a list of tributes. */
function AppendTributeStatsMessages(to: HTMLCollection, from: Tribute[]) {
    if (from.length) {
        for (const i in from) {
            const tribute = from[i]
            let message = to[i]

            message.children[0].innerHTML = tribute.image
            message.children[1].innerHTML = tribute.name
            if (tribute.kills) message.children[2].innerHTML = 'Kills: ' + tribute.kills
            message.children[3].innerHTML = tribute.died_in_round ? 'Died: Round ' + tribute.died_in_round : '<span class="tribute-winner">⭐Winner⭐</span>'
        }
    }
}

/** This function will remove events that are present in all lists and add them to the `all` list instead. */
function FilterQuadruplicateEvents() {
    let lists = Game.event_lists
    let keys = [GameStage.BLOODBATH, GameStage.DAY, GameStage.NIGHT, GameStage.FEAST]
    let all: Event[] = []

    console.log(lists)

    function includes(lst: Event[], event: Event): boolean {
        for (const el of lst)
            if (el.message === event.message) return true
        return false
    }

    for (let key of keys) {
        let lst = lists[key]
        if (lst) for (let ev of lst) {
            let found = 1
            for (let _key of keys) {
                let _lst = lists[_key]
                if (_lst && _lst !== lst && includes(_lst, ev)) found++
            }
            if (found >= 4) if (!includes(all, ev)) all.push(ev)
        }
    }

    for (let ev of all)
        for (let key of keys)
            if (key in lists) lists[key] = (<Event[]>lists[key]).filter(x => x.message !== ev.message)

    if (all.length) {
        if (!lists.all) lists.all = all
        else lists.all.push(...all)
    }

    console.log(lists)

    for (let key of Object.keys(lists)) {
        /// @ts-ignore
        lists[key] = lists[key].map(x => `new Event(\`${x.message}\`, [${x.fatalities}], [${x.killers}], \`${x.type}\`)`)
    }

    let a = document.createElement('a')
    a.setAttribute('href', 'data:application/json;charset:utf-8,' +
        encodeURIComponent(JSON.stringify(lists, null, 4)))
    a.setAttribute('download', 'events.json')
    a.style.display = 'none'
    document.body.append(a)
    a.click()
    a.remove()
}

/// Initialise the default config.
Configuration.default_config = {
    version: 1,
    events: {
        bloodbath: [
            Configuration.MakeStoredEvent(`%0 runs away from the Cornucopia.`),
            Configuration.MakeStoredEvent(`%0 grabs a shovel.`),
            Configuration.MakeStoredEvent(`%0 grabs a backpack and retreats.`),
            Configuration.MakeStoredEvent(`%0 and %1 fight for a bag. %0 gives up and retreats.`),
            Configuration.MakeStoredEvent(`%0 and %1 fight for a bag. %1 gives up and retreats.`),
            Configuration.MakeStoredEvent(`%0 finds a bow, some arrows, and a quiver.`),
            Configuration.MakeStoredEvent(`%0 runs into the cornucopia and hides.`),
            Configuration.MakeStoredEvent(`%0 finds a canteen full of water.`),
            Configuration.MakeStoredEvent(`%0 stays at the cornucopia for resources.`),
            Configuration.MakeStoredEvent(`%0 gathers as much food as %N0 can.`),
            Configuration.MakeStoredEvent(`%0 grabs a sword.`),
            Configuration.MakeStoredEvent(`%0 takes a spear from inside the cornucopia.`),
            Configuration.MakeStoredEvent(`%0 finds a bag full of explosives.`),
            Configuration.MakeStoredEvent(`%0 clutches a first aid kit and runs away.`),
            Configuration.MakeStoredEvent(`%0 takes a sickle from inside the cornucopia.`),
            Configuration.MakeStoredEvent(`%0, %1, and %2 work together to get as many supplies as possible.`),
            Configuration.MakeStoredEvent(`%0 runs away with a lighter and some rope.`),
            Configuration.MakeStoredEvent(`%0 snatches a bottle of alcohol and a rag.`),
            Configuration.MakeStoredEvent(`%0 finds a backpack full of camping equipment.`),
            Configuration.MakeStoredEvent(`%0 grabs a backpack, not realizing it is empty.`),
            Configuration.MakeStoredEvent(`%0 breaks %1's nose for a basket of bread.`),
            Configuration.MakeStoredEvent(`%0, %1, %2, and %3 share everything they gathered before running.`),
            Configuration.MakeStoredEvent(`%0 retrieves a trident from inside the cornucopia.`),
            Configuration.MakeStoredEvent(`%0 grabs a jar of fishing bait while %1 gets fishing gear.`),
            Configuration.MakeStoredEvent(`%0 scares %1 away from the cornucopia.`),
            Configuration.MakeStoredEvent(`%0 grabs a shield leaning on the cornucopia.`),
            Configuration.MakeStoredEvent(`%0 snatches a pair of sais.`),

            Configuration.MakeStoredEvent(`%0 steps off %G0 podium too soon and blows up.`, [0], []),
            Configuration.MakeStoredEvent(`%0 snaps %1's neck.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 finds %1 hiding in the cornucopia and kills %A1.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 finds %1 hiding in the cornucopia, but %1 kills %A0.`, [0], [1]),
            Configuration.MakeStoredEvent(`%0 and %1 fight for a bag. %0 strangles %1 with the straps and runs.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 and %1 fight for a bag. %1 strangles %0 with the straps and runs.`, [0], [1])
        ],
        day: [
            Configuration.MakeStoredEvent(`%0 goes hunting.`),
            Configuration.MakeStoredEvent(`%0 injures %R0.`),
            Configuration.MakeStoredEvent(`%0 explores the arena.`),
            Configuration.MakeStoredEvent(`%0 scares %1 off.`),
            Configuration.MakeStoredEvent(`%0 diverts %1's attention and runs away.`),
            Configuration.MakeStoredEvent(`%0 stalks %1.`),
            Configuration.MakeStoredEvent(`%0 fishes.`),
            Configuration.MakeStoredEvent(`%0 camouflages %R0 in the bushes.`),
            Configuration.MakeStoredEvent(`%0 steals from %1 while %N1 %!1 looking.`),
            Configuration.MakeStoredEvent(`%0 makes a wooden spear.`),
            Configuration.MakeStoredEvent(`%0 discovers a cave.`),
            Configuration.MakeStoredEvent(`%0 attacks %1, but %N1 manage%s1 to escape.`),
            Configuration.MakeStoredEvent(`%0 chases %1.`),
            Configuration.MakeStoredEvent(`%0 runs away from %1.`),
            Configuration.MakeStoredEvent(`%0 collects fruit from a tree.`),
            Configuration.MakeStoredEvent(`%0 receives a hatchet from an unknown sponsor.`),
            Configuration.MakeStoredEvent(`%0 receives clean water from an unknown sponsor.`),
            Configuration.MakeStoredEvent(`%0 receives medical supplies from an unknown sponsor.`),
            Configuration.MakeStoredEvent(`%0 receives fresh food from an unknown sponsor.`),
            Configuration.MakeStoredEvent(`%0 searches for a water source.`),
            Configuration.MakeStoredEvent(`%0 defeats %1 in a fight, but spares %G1 life.`),
            Configuration.MakeStoredEvent(`%0 and %1 work together for the day.`),
            Configuration.MakeStoredEvent(`%0 begs for %1 to kill %A0. %N1 refuse%s1, keeping %0 alive.`),
            Configuration.MakeStoredEvent(`%0 tries to sleep through the entire day.`),
            Configuration.MakeStoredEvent(`%0, %1, %2, and %3 raid %4's camp while %N4 %i4 hunting.`),
            Configuration.MakeStoredEvent(`%0 constructs a shack.`),
            Configuration.MakeStoredEvent(`%0 overhears %1 and %2 talking in the distance.`),
            Configuration.MakeStoredEvent(`%0 practices %G0 archery.`),
            Configuration.MakeStoredEvent(`%0 thinks about home.`),
            Configuration.MakeStoredEvent(`%0 is pricked by thorns while picking berries.`),
            Configuration.MakeStoredEvent(`%0 tries to spear fish with a trident.`),
            Configuration.MakeStoredEvent(`%0 searches for firewood.`),
            Configuration.MakeStoredEvent(`%0 and %1 split up to search for resources.`),
            Configuration.MakeStoredEvent(`%0 picks flowers.`),
            Configuration.MakeStoredEvent(`%0 tends to %1's wounds.`),
            Configuration.MakeStoredEvent(`%0 sees smoke rising in the distance, but decides not to investigate.`),
            Configuration.MakeStoredEvent(`%0 sprains %G0 ankle while running away from %1.`),
            Configuration.MakeStoredEvent(`%0 makes a slingshot.`),
            Configuration.MakeStoredEvent(`%0 travels to higher ground.`),
            Configuration.MakeStoredEvent(`%0 discovers a river.`),
            Configuration.MakeStoredEvent(`%0 hunts for other tributes.`),
            Configuration.MakeStoredEvent(`%0 and %1 hunt for other tributes.`),
            Configuration.MakeStoredEvent(`%0, %1, and %2 hunt for other tributes.`),
            Configuration.MakeStoredEvent(`%0, %1, %2, and %3 hunt for other tributes.`),
            Configuration.MakeStoredEvent(`%0, %1, %2, %3, and %4 hunt for other tributes.`),
            Configuration.MakeStoredEvent(`%0 receives an explosive from an unknown sponsor.`),
            Configuration.MakeStoredEvent(`%0 questions %G0 sanity.`),

            Configuration.MakeStoredEvent(`%0 kills %1 while %N1 %i1 resting.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 begs for %1 to kill %A0. %N1 reluctantly oblige%s1, killing %0.`, [0], [1]),
            Configuration.MakeStoredEvent(`%0 bleeds out due to untreated injuries.`, [0], []),
            Configuration.MakeStoredEvent(`%0 unknowingly eats toxic berries.`, [0], []),
            Configuration.MakeStoredEvent(`%0 silently snaps %1's neck.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 taints %1's food, killing %A1.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 dies from an infection.`, [0], []),
            Configuration.MakeStoredEvent(`%0's trap kills %1.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 dies from hypothermia.`, [0], []),
            Configuration.MakeStoredEvent(`%0 dies from hunger.`, [0], []),
            Configuration.MakeStoredEvent(`%0 dies from thirst.`, [0], []),
            Configuration.MakeStoredEvent(`%0 dies trying to escape the arena.`, [0], []),
            Configuration.MakeStoredEvent(`%0 dies of dysentery.`, [0], []),
            Configuration.MakeStoredEvent(`%0 accidentally detonates a land mine while trying to arm it.`, [0], []),
            Configuration.MakeStoredEvent(`%0 ambushes %1 and kills %A1.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0, %1, and %2 successfully ambush and kill %3, %4, and %5.`, [3, 4, 5], [0, 1, 2]),
            Configuration.MakeStoredEvent(`%0, %1, and %2 unsuccessfully ambush %3, %4, and %5, who kill them instead.`, [0, 1, 2], [3, 4, 5]),
            Configuration.MakeStoredEvent(`%0 forces %1 to kill %2 or %3. %N1 decide%s1 to kill %2.`, [2], [1]),
            Configuration.MakeStoredEvent(`%0 forces %1 to kill %2 or %3. %N1 decide%s1 to kill %3.`, [3], [1]),
            Configuration.MakeStoredEvent(`%0 forces %1 to kill %2 or %3. %N1 refuse%s1 to kill, so %0 kills %A1 instead.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 poisons %1's drink, but mistakes it for %G0 own and dies.`, [0], []),
            Configuration.MakeStoredEvent(`%0 poisons %1's drink. %N1 drink%s1 it and die%s1.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 attempts to climb a tree, but falls on %1, killing them both.`, [0, 1], []),
            Configuration.MakeStoredEvent(`%0, %1, %2, %3, and %4 track down and kill %5.`, [5], [0, 1, 2, 3, 4]),
            Configuration.MakeStoredEvent(`%0, %1, %2, and %3 track down and kill %4.`, [4], [0, 1, 2, 3]),
            Configuration.MakeStoredEvent(`%0, %1, and %2 track down and kill %3.`, [3], [0, 1, 2]),
            Configuration.MakeStoredEvent(`%0 and %1 track down and kill %2.`, [2], [0, 1]),
            Configuration.MakeStoredEvent(`%0 tracks down and kills %1.`, [1], [0])
        ],
        night: [
            Configuration.MakeStoredEvent(`%0 starts a fire.`),
            Configuration.MakeStoredEvent(`%0 sets up camp for the night.`),
            Configuration.MakeStoredEvent(`%0 loses sight of where %N0 %i0.`),
            Configuration.MakeStoredEvent(`%0 climbs a tree to rest.`),
            Configuration.MakeStoredEvent(`%0 goes to sleep.`),
            Configuration.MakeStoredEvent(`%0 and %1 tell stories about themselves to each other.`),
            Configuration.MakeStoredEvent(`%0, %1, %2, and %3 sleep in shifts.`),
            Configuration.MakeStoredEvent(`%0, %1, and %2 sleep in shifts.`),
            Configuration.MakeStoredEvent(`%0 and %1 sleep in shifts.`),
            Configuration.MakeStoredEvent(`%0 tends to %G0 wounds.`),
            Configuration.MakeStoredEvent(`%0 sees a fire, but stays hidden.`),
            Configuration.MakeStoredEvent(`%0 screams for help.`),
            Configuration.MakeStoredEvent(`%0 stays awake all night.`),
            Configuration.MakeStoredEvent(`%0 passes out from exhaustion.`),
            Configuration.MakeStoredEvent(`%0 cooks %G0 food before putting %G0 fire out.`),
            Configuration.MakeStoredEvent(`%0 and %1 run into each other and decide to truce for the night.`),
            Configuration.MakeStoredEvent(`%0 fends %1, %2, and %3 away from %G0 fire.`),
            Configuration.MakeStoredEvent(`%0, %1, and %2 discuss the games and what might happen in the morning.`),
            Configuration.MakeStoredEvent(`%0 cries %R0 to sleep.`),
            Configuration.MakeStoredEvent(`%0 tries to treat %G0 infection.`),
            Configuration.MakeStoredEvent(`%0 and %1 talk about the tributes still alive.`),
            Configuration.MakeStoredEvent(`%0 is awoken by nightmares.`),
            Configuration.MakeStoredEvent(`%0 and %1 huddle for warmth.`),
            Configuration.MakeStoredEvent(`%0 thinks about winning.`),
            Configuration.MakeStoredEvent(`%0, %1, %2, and %3 tell each other ghost stories to lighten the mood.`),
            Configuration.MakeStoredEvent(`%0 looks at the night sky.`),
            Configuration.MakeStoredEvent(`%0 defeats %1 in a fight, but spares %G1 life.`),
            Configuration.MakeStoredEvent(`%0 begs for %1 to kill %A0. %N1 refuse%s1, keeping %0 alive.`),
            Configuration.MakeStoredEvent(`%0 destroys %1's supplies while %N1 %i1 asleep.`),
            Configuration.MakeStoredEvent(`%0, %1, %2, %3, and %4 sleep in shifts.`),
            Configuration.MakeStoredEvent(`%0 lets %1 into %G0 shelter.`),
            Configuration.MakeStoredEvent(`%0 receives a hatchet from an unknown sponsor.`),
            Configuration.MakeStoredEvent(`%0 receives clean water from an unknown sponsor.`),
            Configuration.MakeStoredEvent(`%0 receives medical supplies from an unknown sponsor.`),
            Configuration.MakeStoredEvent(`%0 receives fresh food from an unknown sponsor.`),
            Configuration.MakeStoredEvent(`%0 tries to sing %R0 to sleep.`),
            Configuration.MakeStoredEvent(`%0 attempts to start a fire, but is unsuccessful.`),
            Configuration.MakeStoredEvent(`%0 thinks about home.`),
            Configuration.MakeStoredEvent(`%0 tends to %1's wounds.`),
            Configuration.MakeStoredEvent(`%0 quietly hums.`),
            Configuration.MakeStoredEvent(`%0, %1, and %2 cheerfully sing songs together.`),
            Configuration.MakeStoredEvent(`%0 is unable to start a fire and sleeps without warmth.`),
            Configuration.MakeStoredEvent(`%0 and %1 hold hands.`),
            Configuration.MakeStoredEvent(`%0 convinces %1 to snuggle with %A0.`),
            Configuration.MakeStoredEvent(`%0 receives an explosive from an unknown sponsor.`),
            Configuration.MakeStoredEvent(`%0 questions %G0 sanity.`),

            Configuration.MakeStoredEvent(`%0 kills %1 while %N1 %i1 sleeping.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 begs for %1 to kill %A0. %N1 reluctantly oblige%s1, killing %0.`, [0], [1]),
            Configuration.MakeStoredEvent(`%0 bleeds out due to untreated injuries.`, [0], []),
            Configuration.MakeStoredEvent(`%0 unknowingly eats toxic berries.`, [0], []),
            Configuration.MakeStoredEvent(`%0 silently snaps %1's neck.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 taints %1's food, killing %A1.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 dies from an infection.`, [0], []),
            Configuration.MakeStoredEvent(`%0's trap kills %1.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 dies from hypothermia.`, [0], []),
            Configuration.MakeStoredEvent(`%0 dies from hunger.`, [0], []),
            Configuration.MakeStoredEvent(`%0 dies from thirst.`, [0], []),
            Configuration.MakeStoredEvent(`%0 dies trying to escape the arena.`, [0], []),
            Configuration.MakeStoredEvent(`%0 dies of dysentery.`, [0], []),
            Configuration.MakeStoredEvent(`%0 accidentally detonates a land mine while trying to arm it.`, [0], []),
            Configuration.MakeStoredEvent(`%0 ambushes %1 and kills %A1.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0, %1, and %2 successfully ambush and kill %3, %4, and %5.`, [3, 4, 5], [0, 1, 2]),
            Configuration.MakeStoredEvent(`%0, %1, and %2 unsuccessfully ambush %3, %4, and %5, who kill them instead.`, [0, 1, 2], [3, 4, 5]),
            Configuration.MakeStoredEvent(`%0 forces %1 to kill %2 or %3. %N1 decide%s1 to kill %2.`, [2], [1]),
            Configuration.MakeStoredEvent(`%0 forces %1 to kill %2 or %3. %N1 decide%s1 to kill %3.`, [3], [1]),
            Configuration.MakeStoredEvent(`%0 forces %1 to kill %2 or %3. %N1 refuse%s1 to kill, so %0 kills %A1 instead.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 poisons %1's drink, but mistakes it for %G0 own and dies.`, [0], []),
            Configuration.MakeStoredEvent(`%0 poisons %1's drink. %N1 drink%s1 it and die%s1.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 attempts to climb a tree, but falls on %1, killing them both.`, [0, 1], []),
            Configuration.MakeStoredEvent(`%0, %1, %2, %3, and %4 track down and kill %5.`, [5], [0, 1, 2, 3, 4]),
            Configuration.MakeStoredEvent(`%0, %1, %2, and %3 track down and kill %4.`, [4], [0, 1, 2, 3]),
            Configuration.MakeStoredEvent(`%0, %1, and %2 track down and kill %3.`, [3], [0, 1, 2]),
            Configuration.MakeStoredEvent(`%0 and %1 track down and kill %2.`, [2], [0, 1]),
            Configuration.MakeStoredEvent(`%0 tracks down and kills %1.`, [1], [0])
        ],
        feast: [
            Configuration.MakeStoredEvent(`%0 gathers as much food into a bag as %N0 can before fleeing.`),
            Configuration.MakeStoredEvent(`%0 sobs while gripping a photo of %G0 friends and family.`),
            Configuration.MakeStoredEvent(`%0 and %1 decide to work together to get more supplies.`),
            Configuration.MakeStoredEvent(`%0 and %1 get into a fight over raw meat, but %1 gives up and runs away.`),
            Configuration.MakeStoredEvent(`%0 and %1 get into a fight over raw meat, but %0 gives up and runs away.`),
            Configuration.MakeStoredEvent(`%0, %1, and %2 confront each other, but grab what they want slowly to avoid conflict.`),
            Configuration.MakeStoredEvent(`%0 destroys %1's memoirs out of spite.`),
            Configuration.MakeStoredEvent(`%0, %1, %2, and %3 team up to grab food, supplies, weapons, and memoirs.`),
            Configuration.MakeStoredEvent(`%0 steals %1's memoirs.`),
            Configuration.MakeStoredEvent(`%0 takes a staff leaning against the cornucopia.`),
            Configuration.MakeStoredEvent(`%0 stuffs a bundle of dry clothing into a backpack before sprinting away.`),

            Configuration.MakeStoredEvent(`%0 bleeds out due to untreated injuries.`, [0], []),
            Configuration.MakeStoredEvent(`%0 snaps %1's neck.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 dies from an infection.`, [0], []),
            Configuration.MakeStoredEvent(`%0's trap kills %1.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 ambushes %1 and kills %A1.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0, %1, and %2 successfully ambush and kill %3, %4, and %5.`, [3, 4, 5], [0, 1, 2]),
            Configuration.MakeStoredEvent(`%0, %1, and %2 unsuccessfully ambush %3, %4, and %5, who kill them instead.`, [0, 1, 2], [3, 4, 5]),
            Configuration.MakeStoredEvent(`%0, %1, %2, %3, and %4 track down and kill %5.`, [5], [0, 1, 2, 3, 4]),
            Configuration.MakeStoredEvent(`%0, %1, %2, and %3 track down and kill %4.`, [4], [0, 1, 2, 3]),
            Configuration.MakeStoredEvent(`%0, %1, and %2 track down and kill %3.`, [3], [0, 1, 2]),
            Configuration.MakeStoredEvent(`%0 and %1 track down and kill %2.`, [2], [0, 1]),
            Configuration.MakeStoredEvent(`%0 tracks down and kills %1.`, [1], [0])
        ],
        all: [
            Configuration.MakeStoredEvent(`%0 throws a knife into %1's head.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 accidentally steps on a landmine.`, [0], []),
            Configuration.MakeStoredEvent(`%0 catches %1 off guard and kills %A1.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 and %1 work together to drown %2.`, [2], [0, 1]),
            Configuration.MakeStoredEvent(`%0 strangles %1 after engaging in a fist fight.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 shoots an arrow into %1's head.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 cannot handle the circumstances and commits suicide.`, [0], []),
            Configuration.MakeStoredEvent(`%0 bashes %1's head against a rock several times.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 decapitates %1 with a sword.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 spears %1 in the abdomen.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 sets %1 on fire with a molotov.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 falls into a pit and dies.`, [0], []),
            Configuration.MakeStoredEvent(`%0 stabs %1 while %G1 back is turned.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 severely injures %1, but puts %A1 out of %G1 misery.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 severely injures %1 and leaves %A1 to die.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 bashes %1's head in with a mace.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 pushes %1 off a cliff during a knife fight.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 throws a knife into %1's chest.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 is unable to convince %1 to not kill %A0.`, [0], [1]),
            Configuration.MakeStoredEvent(`%0 convinces %1 to not kill %A0, only to kill %A1 instead.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 falls into a frozen lake and drowns.`, [0], []),
            Configuration.MakeStoredEvent(`%0, %1, and %2 start fighting, but %1 runs away as %0 kills %2.`, [2], [0]),
            Configuration.MakeStoredEvent(`%0 kills %1 with %G1 own weapon.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 overpowers %1, killing %A1.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 sets an explosive off, killing %1.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 sets an explosive off, killing %1, and %2.`, [1, 2], [0]),
            Configuration.MakeStoredEvent(`%0 sets an explosive off, killing %1, %2, and %3.`, [1, 2, 3], [0]),
            Configuration.MakeStoredEvent(`%0 sets an explosive off, killing %1, %2, %3 and %4.`, [1, 2, 3, 4], [0]),
            Configuration.MakeStoredEvent(`%0 kills %1 as %N1 tr%y1 to run.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 and %1 threaten a double suicide. It fails and they die.`, [0, 1], []),
            Configuration.MakeStoredEvent(`%0, %1, %2, and %3 form a suicide pact, killing themselves.`, [0, 1, 2, 3], []),
            Configuration.MakeStoredEvent(`%0 kills %1 with a hatchet.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 and %1 fight %2 and %3. %0 and %1 survive.`, [2, 3], [0, 1]),
            Configuration.MakeStoredEvent(`%0 and %1 fight %2 and %3. %2 and %3 survive.`, [0, 1], [2, 3]),
            Configuration.MakeStoredEvent(`%0 attacks %1, but %2 protects %A1, killing %0.`, [0], [2]),
            Configuration.MakeStoredEvent(`%0 severely slices %1 with a sword.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 strangles %1 with a rope.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 kills %1 for %G1 supplies.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 shoots an arrow at %1, but misses and kills %2 instead.`, [2], [0]),
            Configuration.MakeStoredEvent(`%0 shoots a poisonous blow dart into %1's neck, slowly killing %A1.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 stabs %1 with a tree branch.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 stabs %1 in the back with a trident.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0, %1, and %2 get into a fight. %0 triumphantly kills them both.`, [1, 2], [0]),
            Configuration.MakeStoredEvent(`%0, %1, and %2 get into a fight. %1 triumphantly kills them both.`, [0, 2], [1]),
            Configuration.MakeStoredEvent(`%0, %1, and %2 get into a fight. %2 triumphantly kills them both.`, [0, 1], [2]),
            Configuration.MakeStoredEvent(`%0 kills %1 with a sickle.`, [1], [0]),
            Configuration.MakeStoredEvent(`%0 repeatedly stabs %1 to death with sais.`, [1], [0]),

            Configuration.MakeStoredEvent(`%0 incorporates %1 as a substrate.`, [1], [0], Configuration.V1.StoredEventTag.BigLang),
            Configuration.MakeStoredEvent(`%0 hunts and eats a pidgin.`, [], [], Configuration.V1.StoredEventTag.BigLang),
            Configuration.MakeStoredEvent(`%0 and %1 form a creole together.`, [], [], Configuration.V1.StoredEventTag.BigLang),
            Configuration.MakeStoredEvent(`%0 harvests a wanderwort.`, [], [], Configuration.V1.StoredEventTag.BigLang),
            Configuration.MakeStoredEvent(`%0 takes a calqueulated risk.`, [], [], Configuration.V1.StoredEventTag.BigLang),
            Configuration.MakeStoredEvent(`%0 and %1 realise they're from the same language family and form an alliance.`, [], [], Configuration.V1.StoredEventTag.BigLang),
            Configuration.MakeStoredEvent(`%0 betrays %1—%0 was a false friend!`, [1], [0], Configuration.V1.StoredEventTag.BigLang),
            Configuration.MakeStoredEvent(`While discussing plans with an ally, %0 accidentally uses an exclusive ‘we’ instead of inclusive, sparking civil war.`, [], [], Configuration.V1.StoredEventTag.BigLang),
            Configuration.MakeStoredEvent(`Trapped in %0’s snare, %1 has to remove one of %G1 cases to escape.`, [], [], Configuration.V1.StoredEventTag.BigLang),
            Configuration.MakeStoredEvent(`%0 is feeling tense.`, [], [], Configuration.V1.StoredEventTag.BigLang),
            Configuration.MakeStoredEvent(`%0 invents pictographic marking to note dangerous parts of the arena.`, [], [], Configuration.V1.StoredEventTag.BigLang),
            Configuration.MakeStoredEvent(`%0 adapts %1’s symbols, and scrawls grave insults to agitate and distract the other competitors.`, [], [], Configuration.V1.StoredEventTag.BigLang),
            Configuration.MakeStoredEvent(`%0 labours under the illusion %N0 %i0 ‘pure’ and goes on a rampage, killing %1 and %2 and forcing all others to flee.`, [1, 2], [0], Configuration.V1.StoredEventTag.BigLang),
            Configuration.MakeStoredEvent(`%0 manages to evolve /tʼ/ into poisonous spit and blinds %1.`, [1], [0], Configuration.V1.StoredEventTag.BigLang),
            Configuration.MakeStoredEvent(`%0 loses some coda consonants in a scrap with %1 but manages to innovate some tones to maintain the distinctiveness between its phonemes.`, [], [], Configuration.V1.StoredEventTag.BigLang),
            Configuration.MakeStoredEvent(`%0 undergoes flagrant mergers, resulting in widespread homophony. %N0 then make%s0 many puns, resulting in %1 and %2 ambushing and killing %A0.`, [0], [1, 2], Configuration.V1.StoredEventTag.BigLang),
            Configuration.MakeStoredEvent(`Following %0 and %1’s alliance, they grow closer and undergo ‘cultural synthesis’. They enjoy the experience, and though they then part ways, they leave an everlasting impression on one another.`, [], [], Configuration.V1.StoredEventTag.BigLang),
            Configuration.MakeStoredEvent(`Fed up with %0 insisting %N0 %i0 the \"mother of all languages,\" %1 and %2 brutally strangle %A0 and bond over the experience.`, [0], [1, 2], Configuration.V1.StoredEventTag.BigLang),
            Configuration.MakeStoredEvent(`%0 gets sick and can now only produce nasal vowels.`, [], [], Configuration.V1.StoredEventTag.BigLang)
        ]
    },
    tags: []
}

/// ====================================================================== ///
///  Initialisation                                                        ///
/// ====================================================================== ///
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
