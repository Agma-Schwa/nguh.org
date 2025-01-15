/// ====================================================================== ///
///  Utils                                                                 ///
/// ====================================================================== ///
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
/** The state of the game. This corresponds loosely to the screen being displayed. */
const enum GameState {
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
    tributes_dead: Tribute[],
    number: number,
    stage: GameStage
}

export class Game {

}