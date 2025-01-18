import {UserError} from "$lib/js/trace";
import default_image_src from '$lib/images/hgs-default-character.png'

// ====================================================================== //
//  Utils                                                                 //
// ====================================================================== //
/** The ASCII code of the character `0`. */
const char_zero = '0'.charCodeAt(0)

/** The ASCII code of the character `9`. */
const char_nine = '9'.charCodeAt(0)

/** Using a predicate, check if two arrays are equal. */
function ArraysEqual<T, U>(ts: T[], us: U[], predicate: (t: T, u: U) => boolean) {
    if (ts.length !== us.length) return false
    for (let i = 0; i < ts.length; i++)
        if (!predicate(ts[i], us[i]))
            return false
    return true
}

/** Prompt the user to download a file.
 *
 * @param filename The name that the file should have.
 * @param url The URL of the file.
 * */
export function DownloadURL(filename: string, url: string) {
    let a = document.createElement('a')
    a.setAttribute('href', url)
    a.setAttribute('download', filename)
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    a.remove()
}

/** Clamp a number **/
function clamp(x: number, lo: number, hi: number): number {
    return Math.min(Math.max(x, lo), hi)
}

/**
 * Check if an object is of a given type.
 *
 * The object must be of that exact type. This will return
 * `false` if the object is of a subtype of the type.
 */
function has_type(o: any, type: Function): boolean {
    return typeof o === 'object' && o && o.constructor === type
}

/** Check if a character is between `'0'` and `'9'`. */
function isdigit(char: string): boolean {
    let c = char.charCodeAt(0)
    return c >= char_zero && c <= char_nine
}

/** Generate a random integer in `[from;to[`. */
function random(from: number, to: number): number {
    return Math.floor(Math.random() * (to - from)) + from
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

// ====================================================================== //
//  Tags                                                                  //
// ====================================================================== //
export class Tag {
    static __next_id = 0

    /** All known tags. The id of a tag is an index into this array. */
    static registered_tags: Tag[] = []

    /** Index of the tag in the tag list. */
    readonly id: number

    /** The actual name of the tag. */
    __name: string
    get name(): string { return this.__name }
    set name(name: string) {
        for (const {__name} of Tag.registered_tags)
            if (name == __name)
                throw Error(`A tag with the name ${name} already exists`)
        this.__name = name
    }

    /** Creates a new tag. You probably want to use Tag.for() instead. */
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
        if (!has_type(a, b.constructor)) return false
        return a.__equal(b)
    }

    /** Create a named tag for a given string. */
    static for(name: string): Tag { return Tag.registered_tags.find(t => t.name == name) ?? new Tag(name) }

    /** Dump all tags as JSON */
    static toJSON() { return this.registered_tags }
}

// ====================================================================== //
//  Tributes                                                              //
// ====================================================================== //
export const enum PronounSetting {
    Masculine = "m",
    Feminine = "f",
    Common = "c",
    None = "n",
    Custom = "other",
}

/** Tribute data on the character select screen.. */
export interface TributeCharacterSelectOptions {
    name: string
    custom_pronouns?: string
    pronoun_option: PronounSetting
    image_url?: string
}

/** The options passed to the `Tribute` constructor. */
export interface TributeOptions {
    uses_pronouns: boolean
    pronouns?: TributePronouns
    plural: boolean
    image: string
    tags?: Tag[]
}

/** The N/A/G/R pronouns used by a tribute. */
export interface TributePronouns {
    nominative: string
    accusative: string
    genitive: string
    reflexive: string
}

/** Processed pronouns. */
interface ParsedPronouns {
    pronouns?: TributePronouns
    uses_pronouns: boolean
    plural: boolean
}

/** A tribute in game or on the character selection screen. */
export class Tribute {
    readonly raw_name: string
    readonly name: NameSpan
    readonly pronouns?: TributePronouns
    readonly uses_pronouns: boolean
    readonly image_src: string
    readonly plural: boolean
    kills: number
    died_in_round: GameRound | undefined
    __tags: Tag[]

    constructor(name: string, options: TributeOptions) {
        this.raw_name = name
        this.name = new NameSpan(name)
        this.uses_pronouns = options.uses_pronouns ?? true
        if (this.uses_pronouns) this.pronouns = {...options.pronouns!!}
        this.image_src = options.image ?? ''
        this.plural = options.plural ?? false
        this.kills = 0
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

    /** Add a tag to this tribute. */
    tag(t: Tag): void { if (!this.has(t)) this.__tags.push(t) }
}

/**
 * Parse a pronoun string into a TributePronouns object.
 * @throw UserError if the string is invalid.
 */
function ParsePronounsFromCharacterCreation(character: TributeCharacterSelectOptions): ParsedPronouns {
    let plural = false
    let uses_pronouns = true
    let tribute_pronouns: TributePronouns | undefined = undefined
    let pronoun_str
    switch (character.pronoun_option) {
        case PronounSetting.Masculine:
            pronoun_str = 'he/him/his/himself'
            break
        case PronounSetting.Feminine:
            pronoun_str = 'she/her/her/herself'
            break
        case PronounSetting.Common:
            pronoun_str = 'they/them/their/themself'
            plural = true
            break
        case PronounSetting.None:
            return { plural: false, uses_pronouns: false }
        case PronounSetting.Custom:
            pronoun_str = character.custom_pronouns ?? ''
            pronoun_str = pronoun_str.replaceAll('//', '\x1f')
            if (!pronoun_str.match(/.+\/.+\/.+\/.+/)) throw new UserError('Custom pronouns must be of the form \'nom/acc/gen/reflx\'\nExample: \'they/them/their/themself\'.')
            break
        default:
            throw new UserError('Game character pronoun selection has invalid state');
    }

    let pronouns: string[] = pronoun_str!!.split('/').map(x => x.replaceAll('\x1f', '//').trim())
    if (pronouns.includes('')) throw new UserError('Custom pronouns may not be empty!\nYou have to specify at least one non-whitespace character for each pronoun.')
    tribute_pronouns = {
        nominative: pronouns[0],
        accusative: pronouns[1],
        genitive: pronouns[2],
        reflexive: pronouns[3]
    }

    return {pronouns: tribute_pronouns, uses_pronouns, plural}
}

// ====================================================================== //
//  Configuration and Versioning                                          //
// ====================================================================== //
export namespace Configuration {
    interface MaybeConfig {version?: number}
    interface StoredURL {url: string}
    interface StoredBlob {data: string}

    /** Legacy (unversioned) configuration. */
    namespace Legacy {
        /** An event in a legacy config file. */
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
        export function is(conf: any): conf is Config {
            return !conf || !('version' in conf)
        }

        /** Check whether a configuration is a legacy character configuration. */
        export function IsCharacterConfig(conf: any): conf is CharacterConfig {
            return !conf || !('version' in conf)
        }

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

        /**
         * Load characters from a file.
         *
         * This function is only async because it is async in later config versions.
         **/
        export async function LoadCharacters(data: CharacterConfig): Promise<TributeCharacterSelectOptions[]> {
            return data.characters.map(({ name, custom_pronouns, gender_select, image }) => {
                // Load the image from a URL if it’s not a blob. Old versions of the simulator
                // would produce URLs ending in ‘[object%20Object]’ for some reason. Ignore those.
                let image_url: string | undefined = undefined
                if (
                    typeof image === 'string' &&
                    !image.startsWith('blob:') &&
                    !image.endsWith('[object%20Object]')
                ) image_url = image

                return {
                    name,
                    custom_pronouns,
                    pronoun_option: gender_select as PronounSetting,
                    image_url
                }
            })
        }
    } // namespace Legacy

    /** Configuration version 1. */
    export namespace V1 {
        /** Tag info as stored in a config file. */
        export interface StoredTag {name: string}
        export interface StoredTagRequirement {
            name: string,
            player_index: number
        }

        /** An event in a V1 config file. */
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
        export function is(conf: any): conf is Config {
            return conf && conf.version === 1
        }

        /** Check whether a configuration is a legacy character configuration. */
        export function IsCharacterConfig(conf: any): conf is CharacterConfig {
            return conf && conf.version === 1
        }

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
            // @ts-ignore
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
        export async function LoadCharacters(data: CharacterConfig): Promise<TributeCharacterSelectOptions[]> {
            return await Promise.all(data.characters.map(async ({ name, gender_select, pronoun_str, image }) => {
                let image_url: string | undefined = undefined
                if (typeof image === 'object') {
                    // Image is a URL.
                    if ('url' in image) {
                        // Can’t load blob URLs, so don’t try. Old versions of the simulator would also
                        // produce URLs ending in ‘[object%20Object]’ for some reason. Ignore those.
                        if (!image.url.startsWith('blob:') && !image.url.endsWith('[object%20Object]'))
                            image_url = image.url
                    }

                    // Image is a base-64 encoded data URL.
                    else {
                        const blob = await fetch(image.data).then(r => r.blob())
                        image_url = URL.createObjectURL(blob)
                    }
                }

                return {
                    name,
                    custom_pronouns: pronoun_str,
                    pronoun_option: gender_select as PronounSetting,
                    image_url
                }
            }))
        }
    } /// namespace V1

    type EventComparator<T> = (t: T, e: Event) => boolean
    type EventLoader<T> = (t: T, e: Event[]) => void
    type TagExistsP<T> = (t: T) => boolean
    type TagLoader<T> = (t: T) => void

    export const current_config_version = 1

    /** Check if an event exists */
    function EventExists<T>(
        into_list: Event[],
        conf_event: T,
        equal: EventComparator<T>
    ): boolean {
        for (const event of into_list)
            if (equal(conf_event, event))
                return true;
        return false;
    }

    /** Load the events from the configuration. */
    function LoadEvents<T>(
        into: EventList,
        lists: EventList<T>,
        equal: EventComparator<T>,
        loader: EventLoader<T>
    ) {
        for (const key of Event.list_keys) {
            const into_list = into[key] ??= []
            const from_list = lists[key]
            from_list?.filter(e => !EventExists(into_list, e, equal))
                     ?.forEach(e => loader(e, into_list))
        }
    }

    function LoadTags<T>(tags: T[], exists: TagExistsP<T>, loader: TagLoader<T>) {
        tags.filter(t => !exists(t))
            .forEach(t => loader(t))
    }

    /** Load a configuration. */
    export function Load(
        into: EventList,
        configuration: MaybeConfig,
        overwrite: boolean = false,
        from_local_storage = false
    ) {
        // Legacy file format.
        if (Legacy.is(configuration)) {
            if (overwrite)
                for (const key of Event.list_keys)
                    into[key] = []
            return LoadEvents(into, configuration, Legacy.EventsEqual, Legacy.LoadEvent)
        }

        // Versioned file format.
        else if (V1.is(configuration)) {
            if (overwrite) {
                for (const key of Event.list_keys) into[key] = []
                Tag.registered_tags = []
            }

            LoadTags(configuration.tags, V1.TagExists, V1.LoadTag)
            LoadEvents(into, configuration.events, V1.EventsEqual, V1.LoadEvent)
        }

        // Invalid Configuration. If we're loading from localStorage, just ignore it.
        else if (!from_local_storage) throw Error(`Invalid config version ${configuration.version}`)
    }

    /**
     * Load the default configuration.
     *
     * This should never throw; if it does, there is something horribly wrong
     * with the default configuration below.
     */
    export function LoadDefaultConfig(): EventList {
        const into = {}
        Load(into, BuiltinDefaultConfig, true)
        return into
    }

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
            // @ts-ignore
            const list = Game.event_lists[key] as Event[]
            // @ts-ignore
            const stored_list = lists[key] as V1.StoredEvent[]

            for (const e of list) {
                // Copy the event data.
                let stored_event: V1.StoredEvent = {
                    message: e.message,
                    fatalities: e.fatalities,
                    killers: e.killers,
                    enabled: e.enabled,
                    type: e.type,
                    tag_requirements: []
                }

                // Store the requirements.
                for (const req of e.requirements)
                    stored_event.tag_requirements.push({player_index: req.player_index, name: req.tag.name})

                // Add the events to the lists to store.
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
    export function MakeStoredEvent(
        message: string,
        fatalities: number[] = [],
        killers: number[] = [],
        type: string = "BUILTIN",
        reqs: V1.StoredTagRequirement[] = []
    ): V1.StoredEvent {
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
    export async function SaveCharacters(tributes: TributeCharacterSelectOptions[]): Promise<V1.CharacterConfig | Error> {
        // Serialise Tributes.
        let config: V1.CharacterConfig = {
            version: current_config_version,
            characters: []
        }

        let lasterr: Error | undefined = undefined
        for (const { name, custom_pronouns, pronoun_option, image_url } of tributes) {
            try {
                // Image.
                let image: V1.StoredTributeImage | undefined = undefined

                // Image is a blob. Base-64 encode it.
                if (image_url?.startsWith('blob:')) {
                    const blob = await fetch(image_url).then(r => r.blob())
                    const reader = new FileReader()
                    reader.readAsDataURL(blob)
                    image = {data: await new Promise<string>(resolve => reader.onloadend = () => resolve(reader.result as string))}
                }

                // Image is a URL.
                else if (image_url && image_url !== '') image = {url: image_url}

                // Save the character.
                config.characters.push({
                    name,
                    gender_select: pronoun_option,
                    pronoun_str: custom_pronouns ?? '',
                    image: image,
                    tags: [],
                })
            } catch (e: any) {
                lasterr = e
            }
        }

        return lasterr ?? config
    }

    /** Load characters from a file. **/
    export async function LoadCharacters(data: object): Promise<TributeCharacterSelectOptions[] | Error> {
        try {
            if (Legacy.IsCharacterConfig(data)) return await Legacy.LoadCharacters(data);
            else if (V1.IsCharacterConfig(data)) return await V1.LoadCharacters(data);
            else throw Error(`Invalid character configuration file`)
        } catch (e) {
            return Promise.reject(e)
        }
    }
}

// ====================================================================== //
//  Event                                                                 //
// ====================================================================== //
export class NameSpan {
    readonly value: string
    constructor(value: string) { this.value = value }
}

/**
 * Formatted message parts.
 *
 * The reason this is a thing is to be able to both highlight player names in
 * the message while also preventing HTML injection.
 */
export type FormattedMessage = (string | NameSpan)[]

/**
 * Generate a message describing an event based on the event's message
 * template and the tributes involved.
 *
 * @param event A `GameEvent` (NOT `Event`) for which we want to construct the message.
 * @throw Error if the message template is ill-formed.
 * @return The formatted event message.
 */
function ComposeEventMessage(event: GameEvent): FormattedMessage {
    // Determine whether there is a tribute w/ index `index`.
    function check_bounds(event: GameEvent, index: number) {
        if (index >= event.event.players_involved) throw Error(`
            Index out of bounds.
            Cannot substitute player \'${index}\' in event \'${event.event.message}\' 
            since it only involves ${event.event.players_involved} 
            player${event.event.players_involved > 1 ? 's' : ''}.
            Keep in mind that the first player's formatting code is '%0', not '%1'!
        `)
    }

    let m = event.event.message
    let composed = []
    let prev = 0, i = 0
    outer:
        for (; ;) {
            while (i < m.length && m[i] !== '%') i++
            composed.push(m.slice(prev, i))
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
                    check_bounds(event, m[i].charCodeAt(0) - char_zero)
                    let name = event.players_involved[m[i].charCodeAt(0) - char_zero].name
                    composed.push(name)

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
                case '!':
                case 'w': {
                    let c = m[i++];
                    if (isdigit(m[i])) {
                        let index = m[i].charCodeAt(0) - char_zero
                        let text: string
                        check_bounds(event, index)
                        let tribute = event.players_involved[index]
                        switch (c) {
                            // Pronouns
                            case 'N': text = tribute.uses_pronouns ? tribute?.pronouns?.nominative!! : tribute.raw_name; break
                            case 'A': text = tribute.uses_pronouns ? tribute?.pronouns?.accusative!! : tribute.raw_name; break
                            case 'G': text = tribute.uses_pronouns ? tribute?.pronouns?.genitive!! : tribute.raw_name + '’s'; break
                            case 'R': text = tribute.uses_pronouns ? tribute?.pronouns?.reflexive!! : tribute.raw_name; break

                            // Singular/plural specifiers.
                            case 'e': text = tribute.plural ? '' : 'es'; break            // 3SG        / -es
                            case 's': text = tribute.plural ? '' : 's'; break             // 3SG        / -s
                            case 'y': text = tribute.plural ? 'y' : 'ies'; break          // 3SG -y     / -ies
                            case 'i': text = tribute.plural ? 'are' : 'is'; break         // 3SG are    / is
                            case 'h': text = tribute.plural ? 'have' : 'has'; break       // 3SG have   / has
                            case '!': text = tribute.plural ? 'aren\'t' : 'isn\'t'; break // 3SG aren't / isn't
                            case 'w': text = tribute.plural ? 'were' : 'was'; break       // 3SG were   / was
                            default: continue
                        }
                        composed.push(text)
                        i++
                    } else continue;
                    break;
                }
                default:
                    continue;
            }
            prev = i;
        }
    if (prev < m.length) composed.push(m.slice(prev))
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
    static readonly list_keys = ['day', 'all', 'feast', 'night', 'bloodbath'] as const

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

// ====================================================================== //
//  Game                                                                  //
// ====================================================================== //
export const enum RequiredFatalitiesMode {
    Disable = 'Disable',
    Percent = 'Percent',
    Absolute = 'Absolute',
}

export interface RequiredFatalities {
    mode: RequiredFatalitiesMode,
    value: number
}

/** The state of the game. */
export const enum GameState {
    DEAD,
    NEW_ROUND,
    IN_ROUND,
    THE_FALLEN,
    END_RESULTS,
    END_WINNER,
    END_SUMMARY_FATALITIES,
    END_SUMMARY_STATS,
    END,
    INITIAL = NEW_ROUND,
}

/** The render state of the game. */
export const enum RenderState {
    GAME_OVER,
    ROUND_EVENTS,
    ROUND_DEATHS,
    WINNERS,
    GAME_DEATHS,
    STATS,
}

/** These correspond to the event lists. */
const enum GameStage {
    BLOODBATH = 'bloodbath',
    DAY = 'day',
    NIGHT = 'night',
    FEAST = 'feast'
}

/** An in-game event. */
class GameEvent {
    event: Event
    players_involved: Tribute[]
    message: FormattedMessage

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
export interface EventList<T = Event> {
    bloodbath?: T[],
    day?: T[],
    night?: T[],
    feast?: T[]
    all?: T[]
}

/** A single round in the game. */
interface GameRound {
    game_events: GameEvent[],
    died_this_round: Tribute[],
    index: number,
    stage: GameStage
}

export class GameRenderState {
    /** The render state of the game. */
    readonly state: RenderState

    /** Title to display at the top of the screen. */
    readonly game_title: string

    /** The game rounds. */
    readonly rounds: GameRound[]

    /** The tributes that died this day. */
    readonly tributes_died: Tribute[]

    /** The tributes that are still alive. */
    readonly tributes_alive: Tribute[]

    constructor(
        state: RenderState,
        game_title: string,
        rounds: GameRound[],
        tributes_died: Tribute[],
        tributes_alive: Tribute[]
    ) {
        this.state = state
        this.game_title = game_title
        this.rounds = rounds
        this.tributes_died = tributes_died
        this.tributes_alive = tributes_alive
    }

    get deaths() { return this.tributes_died.length }
    get has_alive() { return this.tributes_alive.length > 0 }
    get has_deaths() { return this.deaths > 0 }
    get round() { return this.rounds[this.rounds.length - 1] }
    is(...state: RenderState[]) { return state.includes(this.state) }
}

export class Game {
    /** All tributes in the game, irrespective of alive or dead. */
    readonly tributes: Tribute[]

    /** All tributes that are still alive. */
    tributes_alive: Tribute[]

    /**
     * All tributes that died since the last time we showed deaths.
     *
     * For instance, if there was a bloodbath, day, and night, this will
     * include the deaths for all three of those rounds.
     */
    #tributes_died: Tribute[] = []

    /** The current state of the game (i.e. of the last round). */
    #state: GameState = GameState.INITIAL

    /** The title of the current round. */
    #game_title: string = ''

    /** The last time a feast happened. */
    last_feast: number = 0

    /** The current game stage. */
    stage: GameStage = GameStage.BLOODBATH

    /** Rate at which events that result in a fatality are rerolled. */
    readonly fatality_reroll_rate: number

    /** Whether every tribute that is still alive has won. */
    all_won: boolean = false

    /** All rounds that have happened since the start of this game. */
    rounds: GameRound[] = []

    /** Number of days that have passed. */
    days_passed: number = 0

    /** Number of nights that have passed. */
    nights_passed: number = 0

    /** Event list used by this game. */
    readonly event_list: GameEventList

    /** Minimum number of fatalities per round. */
    readonly required_fatalities: number | undefined = undefined

    /** Create a new game. */
    constructor(
        tributes: Tribute[],
        events: EventList,
        fatalities: RequiredFatalities,
        fatality_reroll_rate: number = .6
    ) {
        this.tributes = [...tributes] // We want our own copy of this.
        this.tributes_alive = [...tributes]
        this.fatality_reroll_rate = fatality_reroll_rate
        this.event_list = {
            bloodbath: [],
            day: [],
            night: [],
            feast: []
        }

        /// Set required fatality rate.
        if (fatalities.mode !== RequiredFatalitiesMode.Disable) {
            if (isFinite(fatalities.value)) {
                // Relative to the total number of tributes.
                if (fatalities.mode === RequiredFatalitiesMode.Percent) {
                    this.required_fatalities = Math.ceil(
                        (clamp(fatalities.value, 0, 100) / 100.0) * this.tributes.length
                    )
                }

                // Absolute.
                else this.required_fatalities = Math.max(0, fatalities.value)

                // Shouldn’t ever happen, but still.
                if (!isFinite(this.required_fatalities as number)) this.required_fatalities = undefined
            }
        }

        this.#AddEvents(events)
    }

    /** Get the current round. */
    get last_round() { return this.rounds[this.rounds.length - 1] }

    /** Add all events from an event list to the game. */
    #AddEvents(event_option_list: EventList) {
        if (event_option_list.all) {
            for (let event_list of [this.event_list.bloodbath, this.event_list.day, this.event_list.night, this.event_list.feast])
                event_list.push(...event_option_list.all.filter(e => e.enabled))
        }

        for (let property of [GameStage.BLOODBATH, GameStage.DAY, GameStage.NIGHT, GameStage.FEAST])
            if (event_option_list[property])
                this.event_list[property].push(...(<Event[]>event_option_list[property]).filter(e => e.enabled))
    }

    /** The main state machine controlling the game. */
    #AdvanceGame(): GameRenderState {
        const state = this.#TickRenderState()

        // Advance the state and perform and action accordingly.
        switch (this.#state) {
            case GameState.NEW_ROUND:
                this.#state = GameState.IN_ROUND
                this.#StartNewRound()
                this.#DoRound()
                break

            case GameState.IN_ROUND:
                this.#DoRound()
                break

            case GameState.THE_FALLEN:
                this.#game_title = 'The Fallen'
                this.#state = GameState.NEW_ROUND
                break

            case GameState.END_RESULTS:
                this.#game_title = 'The Fallen'
                this.#state = GameState.END_WINNER
                break

            case GameState.END_WINNER:
                this.#game_title = 'The Games Have Ended'
                this.#state = GameState.END_SUMMARY_FATALITIES
                break

            case GameState.END_SUMMARY_FATALITIES:
                this.#game_title = 'Deaths'
                this.#state = GameState.END_SUMMARY_STATS
                break

            case GameState.END_SUMMARY_STATS:
                this.#game_title = this.tributes_alive.length ? 'Winners' : 'The Fallen' // this.DisplayFinalStats()
                this.#state = GameState.END
                break

            case GameState.END:
                break

            default:
                this.#state = GameState.DEAD
                throw new Error('An internal error has occurred; Game.state was ' + this.#state)
        }

        return new GameRenderState(
            state,
            this.#game_title,
            this.rounds,
            this.#state === GameState.END
                ? this.tributes.filter(t => t.died_in_round !== undefined)
                : this.#tributes_died,
            this.tributes_alive
        );
    }

    /** Determine what the next game stage should be. */
    #AdvanceGameStage(): GameStage {
        // Start of game is always Bloodbath.
        if (this.rounds.length === 0) return GameStage.BLOODBATH

        // Feast and Bloodbath are followed by Day.
        if (this.stage === GameStage.FEAST || this.stage === GameStage.BLOODBATH) {
            this.days_passed++
            return GameStage.DAY
        }

        // Night is followed by Day or Feast.
        if (this.stage === GameStage.NIGHT) {
            // Feast can occur before Day once every 5+ as follows:
            //   - 5 rounds: 25% chance,
            //   - 6 rounds: 33% chance,
            //   - 7+ rounds: 50% chance.
            let rounds_since_feast = this.rounds.length - this.last_feast;
            if (rounds_since_feast >= 5) block: {
                if (rounds_since_feast >= 7) {
                    if (Math.random() > .50 * (rounds_since_feast - 4)) break block
                } else if (rounds_since_feast >= 6) {
                    if (Math.random() > .33 * (rounds_since_feast - 4)) break block
                } else {
                    if (Math.random() > .25 * (rounds_since_feast - 4)) break block
                }

                this.last_feast = this.rounds.length;
                return GameStage.FEAST
            }

            // Otherwise, it's Day.
            this.days_passed++
            return GameStage.DAY
        }

        this.nights_passed++
        return GameStage.NIGHT
    }

    /** Determine whether the game should end based on how may tributes are alive or whether all should win. */
    #CheckGameShouldEnd() {
        if (this.tributes_alive.length < 2 || this.all_won) {
            this.#state = GameState.END_RESULTS
            return true
        }

        return false
    }

    /** Perform the next round and advance the game state. */
    #DoRound() {
        this.stage = this.#AdvanceGameStage()
        this.#DoRoundImpl()

        // Check if the game should end; if not, move to display the results
        // of this round if it was night.
        if (!this.#CheckGameShouldEnd() && this.stage == GameStage.NIGHT)
            this.#state = GameState.THE_FALLEN
    }

    /**
     * Perform the next round.
     *
     * This keeps choosing events randomly until all characters
     * have acted in an event.
     */
    #DoRoundImpl() {
        // Get the number of tributes.
        let tributes_left = this.tributes_alive.length
        let tributes_alive = tributes_left
        let current_tribute = 0

        // Determine the current round title.
        if (this.stage === GameStage.DAY) this.#game_title = `Day ${this.days_passed}`
        else if (this.stage === GameStage.NIGHT) this.#game_title = `Night ${this.nights_passed}`
        else this.#game_title = this.stage.slice(0, 1).toUpperCase() + this.stage.slice(1)

        // Create the round.
        let round: GameRound = {
            game_events: [],
            died_this_round: [],
            index: this.rounds.length,
            stage: this.stage
        }

        // Save it to the list of rounds.
        this.rounds.push(round)

        // Shuffle the tributes to randomise the encounters.
        shuffle(this.tributes_alive)

        // Get the event list for the current stage.
        let event_list: Event[]
        switch (this.stage) {
            case GameStage.BLOODBATH: event_list = this.event_list.bloodbath; break
            case GameStage.DAY: event_list = this.event_list.day; break
            case GameStage.NIGHT: event_list = this.event_list.night; break
            case GameStage.FEAST: event_list = this.event_list.feast; break
            default: throw Error(`Invalid game stage '${this.stage}'`)
        }

        // If the list contains no events, then there's nothing to do.
        if (!event_list.length) return
        let died_this_round = 0

        // Randomly pick an event from the corresponding event list
        // whose number of tributes involved does not exceed the number
        // of tributes left. Ensure that every tribute is only picked once.
        // Repeat until no tributes are left.
        outer: while (tributes_left) {
            let tributes_involved: Tribute[] = []
            let event: Event

            // Choose an event at random. Make sure we don't fall into an infinite loop.
            let tries = 0
            do {
                if (tries++ > Math.max(100, event_list.length * 10)) break outer
                event = event_list[random(0, event_list.length)]
            } while (!this.#RequirementsSatisfied(event, current_tribute, tributes_left, died_this_round))
            tributes_left -= event.players_involved

            // Handle fatalities.
            for (const f of event.fatalities) {
                this.tributes_alive[current_tribute + f].died_in_round = round
                round.died_this_round.push(this.tributes_alive[current_tribute + f])
                tributes_alive--
                died_this_round++
            }

            // Credit killers.
            for (const k of event.killers) this.tributes_alive[current_tribute + k].kills += event.fatalities.length

            // Add all players affected to the event.
            let last = current_tribute + event.players_involved
            for (; current_tribute < last; current_tribute++) tributes_involved.push(this.tributes_alive[current_tribute])

            // And register the event.
            round.game_events.push(new GameEvent(event, tributes_involved))

            // Finally, if only one person is left, they’re the winner (and if no
            // one is alive anymore, there is no winner).
            if (tributes_alive < 2) break
        }

        // If the user set a fixed number of deaths to happen each round, then all
        // of them will be at the start of the list since we first ensure that we
        // have the required amount. That’s fine, but we should shuffle them after
        // the fact so all the deaths don’t end up displayed at the top since that
        // can make things a bit anticlimactic.
        shuffle(round.game_events)

        // Remove any tributes that are now dead from the alive list.
        this.tributes_alive = this.tributes_alive.filter(t => t.died_in_round === undefined)

        // And add them to the list of all tributes that have died since we last
        // displayed deaths.
        this.#tributes_died.push(...round.died_this_round)
    }

    /**
     * Check requirements for an event.
     *
     * There are several restrictions as to what events we can use
     * at any given point in time.
     */
    #RequirementsSatisfied(
        event: Event,
        current_tribute: number,
        tributes_left: number,
        died_this_round: number
    ): boolean {
        // An event must not involve more players than are left.
        if (event.players_involved > tributes_left) return false

        // If there is a required number of fatalities, we want to drive
        // the number of fatalities higher. If we’ve already achieved the
        // required number of fatalities, we don’t want any more fatalities.
        if (this.required_fatalities) {
            if (died_this_round < this.required_fatalities && !event.fatalities.length) return false
            if (died_this_round >= this.required_fatalities && event.fatalities.length) return false
        }

        // Otherwise, if an event has fatalities, we might want to do the opposite and
        // reroll it depending on the fatality_reroll_rate and whether we’ve already
        // achieved the required number of fatalities.
        else if (event.fatalities.length && Math.random() < this.fatality_reroll_rate) return false

        // If an event has tag requirements, it can only be chosen if the players fit those requirements.
        for (const {tag, player_index} of event.requirements)
            if (!this.tributes_alive[current_tribute + player_index].has(tag))
                return false;

        // Otherwise this event is fine.
        return true;
    }

    /** Start a new round. */
    #StartNewRound() {
        this.#tributes_died = []
    }

    /** Set and determine the current render state. */
    #TickRenderState(): RenderState {
        switch (this.#state) {
            case GameState.NEW_ROUND:
            case GameState.IN_ROUND:
                return RenderState.ROUND_EVENTS

            case GameState.THE_FALLEN:
            case GameState.END_RESULTS:
                return RenderState.ROUND_DEATHS

            case GameState.END_WINNER:
                return RenderState.WINNERS

            case GameState.END_SUMMARY_FATALITIES:
                return RenderState.GAME_DEATHS

            case GameState.END_SUMMARY_STATS:
                return RenderState.STATS

            case GameState.DEAD:
            case GameState.END:
                return RenderState.GAME_OVER
        }
    }

    /** Step the game by a round. */
    AdvanceGame(): GameRenderState | Error {
        return Game.#Try(() => this.#AdvanceGame())
    }

    /**
     * Convert tributes on the character select screen to the in-game tributes.
     *
     * @return An array of tributes or an error if the conversion failed.
     */
    static CreateTributesFromCharacterSelectOptions(
        options: TributeCharacterSelectOptions[]
    ): Tribute[] | Error {
        return Game.#Try(() => options.map((character) => {
            if (character.name === '') throw Error('Character name must not be empty!')
            const pronouns = ParsePronounsFromCharacterCreation(character)
            return new Tribute(character.name, {
                pronouns: pronouns.pronouns,
                uses_pronouns: pronouns.uses_pronouns,
                plural: pronouns.plural,
                image: character.image_url ?? default_image_src,
                tags: []
            })
        }))
    }

    static #Try<T>(func: () => T): T | Error {
        try { return func() }
        catch (e) { return e as Error }
    }

/*    static events() {
        return {
            * [Symbol.iterator](): Iterator<Event> {
                for (let event_list_name of Object.keys(Game.event_lists))
                    // @ts-ignore
                    for (let event of Game.event_lists[event_list_name] as Event[])
                        yield event
            }
        }
    }*/
}

// ====================================================================== //
//  Data                                                                  //
// ====================================================================== //
/** Default event list. */
const BuiltinEventList: EventList<Configuration.V1.StoredEvent> = Object.freeze({
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
})

const BuiltinDefaultConfig: Configuration.V1.Config = Object.freeze({
    version: 1,
    events: BuiltinEventList,
    tags: []
})