export interface Sense {
    def: string,
    comment?: string,
    examples?: string[]
}

export interface FullEntry {
    word: string,
    pos: string,
    etym?: string,
    ipa?: string,
    def?: Sense,
    forms?: string,
    senses?: Sense[],
    "def-search": string,
    "hw-search": string
}

export interface RefEntry {
    from: string,
    "from-search": string,
    to: string,
}

export type Entry = FullEntry | RefEntry

export interface Dictionary {
    entries: FullEntry[],
    refs: RefEntry[]
}