export interface Sense {
    def: string,
    examples?: string[]
}

export interface FullEntry {
    word: string,
    pos: string,
    etym?: string,
    def?: string,
    forms?: string,
    senses?: Sense[],
    "def-search": string,
    "hw-search": string
}

export interface RefEntry {
    from: string,
    to: string,
}

export interface Dictionary {
    entries: FullEntry[],
    refs: RefEntry[]
}