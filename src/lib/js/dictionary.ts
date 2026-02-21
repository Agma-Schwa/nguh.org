export namespace Dictionary {
    export type Data = { entries: Entry[] }
    export type Entry = FullEntry | RefEntry

    export type RefEntry = {
        word: Node,
        ref: Node,
        search: string,
    }

    export type FullEntry = {
        word: Node,
        pos: Node,
        etym?: Node,
        ipa?: Node,
        primary_definition?: Sense,
        senses?: Sense[],
        forms?: Node,
        hw_search: string,
        def_search: string,
    }

    export type Sense = {
        def: Node,
        comment?: Node,
        examples?: Example[],
    }

    export type Example = {
        text: Node,
        comment?: Node
    }

    export type Node = TextNode
                     | MathNode
                     | GroupNode
                     | MacroNode
                     | CustomMacroNode

    export type TextNode = { text: string }
    export type MathNode = { math: string }
    export type GroupNode = { group: Node[] }
    export type MacroNode = {
        macro: {
            name: BuiltinMacro,
            args?: Node[],
        }
    }
    export type CustomMacroNode = {
        custom_macro: {
            name: string,
            args?: Node[],
        }
    }

    export type BuiltinMacro = "bold"
                             | "ellipsis"
                             | "italic"
                             | "lemma"
                             | "normal"
                             | "paragraph_break"
                             | "sense"
                             | "small_caps"
                             | "subscript"
                             | "superscript"
                             | "soft_hyphen"
                             | "this"
                             | "reference"
}

export enum SearchMode {
    Headword = "Headword",
    Definition = "Definition",
}


export function IsFullEntry(e: Dictionary.Entry): e is Dictionary.FullEntry {
    return !IsRefEntry(e)
}

export function IsRefEntry(e: Dictionary.Entry): e is Dictionary.RefEntry {
    return 'ref' in e
}