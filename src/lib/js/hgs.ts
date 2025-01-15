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
    pronouns: TributePronouns
    plural: boolean
    image: string
    tags?: Tag[]
}

/** The N/A/G/R pronouns used by a tribute. */
export interface TributePronouns {
    nominative?: string
    accusative?: string
    genitive?: string
    reflexive?: string
}

/** Processed pronouns. */
interface ParsedPronouns {
    pronouns?: TributePronouns
    uses_pronouns: boolean
    plural: boolean
}

/** A tribute in game or on the character selection screen. */
class Tribute {
    raw_name: string
    pronouns: TributePronouns
    uses_pronouns: boolean
    image_src: string
    plural: boolean
    kills: number
    died_in_round: GameRound | undefined
    __tags: Tag[]

    constructor(name: string, options: TributeOptions) {
        this.raw_name = name
        this.pronouns = {}
        this.uses_pronouns = options.uses_pronouns ?? true
        if (this.uses_pronouns) this.pronouns = {...options.pronouns}
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

    get name() { return `<span class="tribute-name">${this.raw_name}</span>` }
    get image() { return `<img class="tribute-image" alt="${this.raw_name}" src="${this.image_src}"></img>` }

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
namespace Configuration {
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
            // Add the events.
            // @ts-ignore
            const list = lists[key] as T[]
            list.filter(e => !EventExists(e, equalp))
                // @ts-ignore
                .forEach(e => loader(e, Game.event_lists[key]))
        }
    }

    function LoadTags<T>(tags: T[], existsp: TagExistsP<T>, loader: TagLoader<T>) {
        tags.filter(t => !existsp(t))
            .forEach(t => loader(t))
    }

    /** Load a configuration. */
    export function Load(configuration: MaybeConfig, overwrite: boolean = false, from_local_storage = false) {
        // Legacy file format.
        if (Legacy.is(configuration)) {
            if (overwrite)
                for (const key of Event.list_keys)
                    // @ts-ignore
                    Game.event_lists[key] = []

            LoadEvents(configuration, Legacy.EventsEqual, Legacy.LoadEvent)
        }

        // Versioned file format.
        else if (V1.is(configuration)) {
            if (overwrite) {
                // @ts-ignore
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
/**
 * Generate a message describing an event based on the event's message
 * template and the tributes involved.
 *
 * @param event A `GameEvent` (NOT `Event`) for which we want to construct the message.
 * @throw Error if the message template is ill-formed.
 * @return The formatted event message.
 */
function ComposeEventMessage(event: GameEvent): string {
    /// Determine whether there is a tribute w/ index `index`.
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
                    check_bounds(event, m[i].charCodeAt(0) - char_zero)
                    let name = event.players_involved[m[i].charCodeAt(0) - char_zero].name
                    composed += name

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
                        let text
                        check_bounds(event, index)
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
                            case 'w': text = tribute.plural ? 'were' : 'was'; break       // 3SG were   / was
                            default: continue
                        }
                        composed += text
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

// ====================================================================== //
//  Game                                                                  //
// ====================================================================== //
export const enum RequiredFatalities {
    Disable = 'Disable',
    Percent = 'Percent',
    Absolute = 'Absolute',
}

/** The state of the game. This corresponds loosely to the screen being displayed. */
export const enum GameState {
    DEAD,
    INITIAL,
    ROUND_PART_1,
    ROUND_PART_2,
    ROUND_RESULTS,
    END_RESULTS,
    END_WINNER,
    END_SUMMARY_FATALITIES,
    END_SUMMARY_STATS,
    END,
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
    died_this_round: Tribute[],
    index: number,
    stage: GameStage
}

export class Game {
    static event_lists: EventList = {bloodbath: [], day: [], night: [], feast: [], all: []}

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
    tributes_died: Tribute[] = []

    /** The title of the current round. */
    game_title: string = ''

    /** The current state of the game (i.e. of the last round). */
    state: GameState = GameState.INITIAL

    /** The state we should go to next. */
    #next_state: GameState = GameState.INITIAL

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
    readonly events: GameEventList

    /** Minimum number of fatalities per round. */
    readonly required_fatalities: number | undefined = undefined

    /** Create a new game. */
    constructor(
        tributes: Tribute[],
        required_fatalities_mode: RequiredFatalities = RequiredFatalities.Disable,
        required_fatalities_per_cent: string = '0',
        fatality_reroll_rate: number = .6
    ) {
        this.tributes = [...tributes] // We want our own copy of this.
        this.tributes_alive = [...tributes]
        this.fatality_reroll_rate = fatality_reroll_rate
        this.events = {
            bloodbath: [],
            day: [],
            night: [],
            feast: []
        }

        /// Set required fatality rate.
        if (required_fatalities_mode !== RequiredFatalities.Disable) {
            const value = parseInt(required_fatalities_per_cent.replaceAll('%', '').trim(), 10)
            if (isFinite(value)) {
                // Relative to the total number of tributes.
                if (required_fatalities_mode === RequiredFatalities.Percent)
                    this.required_fatalities = Math.ceil((clamp(value, 0, 100) / 100.0) * this.tributes.length)

                // Absolute.
                else this.required_fatalities = Math.max(0, value)

                // Shouldn’t ever happen, but still.
                if (!isFinite(this.required_fatalities as number)) this.required_fatalities = undefined
            }
        }

        this.#AddEvents(Game.event_lists)
    }

    /** Add all events from an event list to the game. */
    #AddEvents(event_option_list: EventList) {
        if (event_option_list.all) {
            for (let event_list of [this.events.bloodbath, this.events.day, this.events.night, this.events.feast])
                event_list.push(...event_option_list.all.filter(e => e.enabled))
        }

        for (let property of [GameStage.BLOODBATH, GameStage.DAY, GameStage.NIGHT, GameStage.FEAST])
            if (event_option_list[property])
                this.events[property].push(...(<Event[]>event_option_list[property]).filter(e => e.enabled))
    }

    /** The main state machine controlling the game. */
    #AdvanceGame() {
        window.scrollTo(0, 0)

        // Advance the state and perform and action accordingly.
        this.state = this.#next_state
        switch (this.state) {
            case GameState.INITIAL:
            case GameState.ROUND_PART_1:
                this.#NextRound()
                this.state = GameState.ROUND_PART_1

                // Bloodbath and Feast *precede* Day, so stay in this state and only go
                // to Night if this was an actual Day.
                if (
                    !this.#CheckGameShouldEnd() &&
                    this.stage !== GameStage.BLOODBATH &&
                    this.stage !== GameStage.FEAST
                ) this.#next_state = GameState.ROUND_PART_2
                break

            case GameState.ROUND_PART_2:
                this.#NextRound()
                if (!this.#CheckGameShouldEnd()) this.#next_state = GameState.ROUND_RESULTS
                break

            case GameState.ROUND_RESULTS:
                this.game_title = 'The Fallen' // DisplayRoundFatalities()
                this.#next_state = GameState.ROUND_PART_1
                break

            case GameState.END_RESULTS:
                this.game_title = 'The Fallen' // DisplayRoundFatalities()
                this.#next_state = GameState.END_WINNER
                break

            case GameState.END_WINNER:
                this.game_title = 'The Games have ended' // this.Display(NO)Winners()
                this.#next_state = GameState.END_SUMMARY_FATALITIES
                break

            case GameState.END_SUMMARY_FATALITIES:
                this.game_title = 'Deaths' // this.DisplayFinalFatalities()
                this.#next_state = GameState.END_SUMMARY_STATS
                break

            case GameState.END_SUMMARY_STATS:
                this.game_title = this.tributes_alive.length ? 'Winners' : 'The Fallen' // this.DisplayFinalStats()
                this.#next_state = GameState.END
                break

            case GameState.END:
                // this.ReturnToMainMenu()
                break

            default:
                this.#next_state = GameState.DEAD
                throw new Error('An internal error has occurred; Game.state was ' + this.state)
        }

        // FIXME: We probably want a custom <Image> component instead.
        // @ts-ignore
        window.SetOpenImagePreview()
    }

    /** Determine whether the game should end based on how may tributes are alive or whether all should win. */
    #CheckGameShouldEnd() {
        if (this.tributes_alive.length < 2 || this.all_won) {
            this.#next_state = GameState.END_RESULTS
            return true
        }

        return false
    }


    /** Determine what the next game stage should be and set it. */
    #NextGameStage(): GameStage {
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

    /**
     * Perform the next round.
     *
     * This keeps choosing events randomly until all characters
     * have acted in an event.
     */
    #NextRound() {
        // Get the number of tributes.
        let tributes_left = this.tributes_alive.length
        let tributes_alive = tributes_left
        let current_tribute = 0

        // Get the appropriate game stage.
        this.stage = this.#NextGameStage()

        // Determine the current round title.
        if (this.stage === GameStage.DAY) this.game_title = `Day ${this.days_passed}`
        else if (this.stage === GameStage.NIGHT) this.game_title = `Night ${this.nights_passed}`
        else this.game_title = this.stage.slice(0, 1).toUpperCase() + this.stage.slice(1)

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
            case GameStage.BLOODBATH: event_list = this.events.bloodbath; break
            case GameStage.DAY: event_list = this.events.day; break
            case GameStage.NIGHT: event_list = this.events.night; break
            case GameStage.FEAST: event_list = this.events.feast; break
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
        this.tributes_died.push(...round.died_this_round)
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

    /** Step the game by a round. */
    AdvanceGame() { return Game.#Try(() => this.#AdvanceGame()) }

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
                pronouns: pronouns.pronouns ?? {},
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

    static events() {
        return {
            * [Symbol.iterator](): Iterator<Event> {
                for (let event_list_name of Object.keys(Game.event_lists))
                    // @ts-ignore
                    for (let event of Game.event_lists[event_list_name] as Event[])
                        yield event
            }
        }
    }
}