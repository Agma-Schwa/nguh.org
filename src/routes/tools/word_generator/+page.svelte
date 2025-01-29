<script lang='ts'>
    import Page from '$lib/components/Page.svelte';
    import Stripe from '$lib/components/Stripe.svelte';
    import {DownloadURL} from '$lib/js/hgs.svelte';
    import {Stream, StreamImpl} from '$lib/js/stream';
    import ErrorDialog from '$lib/components/dialog/ErrorDialog.svelte';
    import ConfirmDialog from '$lib/components/dialog/ConfirmDialog.svelte';
    import {browser} from '$app/environment';
    import {Persist} from '$lib/js/persist.svelte';

    type Classes = Map<string, string[]>
    abstract class Node {
        abstract count(): number
        abstract deep_equals_impl(n: Node): boolean
        abstract generate(): string[]

        deep_equals(n: Node): boolean { return n.constructor === this.constructor && this.deep_equals_impl(n) }
        empty() { return this instanceof Literal && this === Literal.Empty }
    }

    abstract class NodeWithElements extends Node {
        readonly elements: Node[]
        protected constructor(elements: Node[]) {
            super()
            this.elements = elements
        }

        override deep_equals_impl(n: NodeWithElements): boolean {
            return ArraysEqual(this.elements, n.elements, (a, b) => a.deep_equals(b))
        }
    }

    class Alternates extends NodeWithElements {
        private constructor(nodes: Node[]) { super(nodes) }
        override count(): number { return this.elements.reduce((acc, a) => acc + a.count(), 0) }
        override generate(): string[] {
            const words: string[] = []
            for (const a of this.elements) words.push(...a.generate())
            return words
        }

        // Create a canonical set of alternates.
        static Make(elements: Node[], keep_empty: boolean): Node {
            function Add(array: Node[], n: Node) {
                // Unwrap nested alternates.
                //
                // This step is required to fold (for C := p, t, k) a construct
                // such as (C|p) to (p|t|k|p) -> (p|t|k).
                if (n instanceof Alternates) {
                    for (const e of n.elements) Add(array, e)
                    return
                }

                // Remove empty elements if we’re discarding them.
                if (!keep_empty && n.empty()) return

                // Anything else just keep as-is.
                array.push(n)
            }

            // Add all elements.
            let a: Node[] = []
            for (const el of elements) Add(a, el)

            // Filter out duplicates.
            //
            // FIXME: This should instead check if 'f' is a subset of 'e' so
            //        we can fold a[t|k]b|a[t|k|p]b -> a[t|k|p]b, but it isn’t
            //        obvious to me how to do this in the general case without
            //        generating all possible words.
            //
            // TODO: Actually, that’s wrong: the subset check still wouldn’t handle
            //       cases such as r[a|b|c]s|r[a|b|d]s, which involve overlapping
            //       sets of which neither is a subset of the other. I think we
            //       actually just need to compile this to a DFA and minimise this
            //       to remove the overlap (I think just the conversion process
            //       should take care of this on its own if we do it right).
            //
            // TODO: Instead of relying on this for counting, simply execute the
            //       generation (but without actually outputting words), which
            //       should be linear in the number of steps.
            //
            // TODO: Can we exploit that to minimise this properly? Or can we maybe
            //       use a proper DFA minimalisation algorithm for this?
            a = a.filter((e, i) => a.findIndex(f => f.deep_equals(e)) === i)

            // Sort the elements so that that we can compare alternates properly and
            // fold cases such as a[d|t]b|a[t|d]b -> a[d|t]b|a[d|t]b -> a[d|t]b.
            a = a.sort(Alternates.#CompareElements)

            // Canonicalise structure.
            if (a.length === 0) return Literal.Empty
            if (a.length === 1) return a[0]
            return new Alternates(a)
        }

        // Compare elements lexicographically.
        //
        // We establish a lexicographical order by sorting literals before alternates,
        // and alternates before, sequences; furthermore, literals are sorted according
        // to the lexicographical order of their text, and sequences and alternates according
        // to the lexicographical order of their elements, recursively.
        //
        // Note that the elements can’t be alternates since we collapse nested alternates.
        static #CompareElements(a: Node, b: Node): number {
            // At least one element is a literal.
            if (a instanceof Literal && b instanceof Literal) return a.text.localeCompare(b.text)
            if (a instanceof Literal) return -1
            if (b instanceof Literal) return 1

            // Exactly one element is an alternate.
            if (a.constructor !== b.constructor) {
                if (a instanceof Alternates) return -1;
                if (b instanceof Alternates) return 1;
            }

            // The elements are both sequences or both alternates.
            let i = 0
            const sa = (a as NodeWithElements).elements
            const sb = (b as NodeWithElements).elements
            for (;;) {
                if (i == sa.length && i == sb.length) return 0
                if (i == sa.length) return -1
                if (i == sb.length) return 1
                const cmp = Alternates.#CompareElements(sa[i], sb[i])
                if (cmp != 0) return cmp
                i++
            }
        }
    }

    class Literal extends Node {
        static readonly Empty = new Literal('')

        readonly text: string
        private constructor(text: string) {
            super()
            this.text = text
        }

        static Of(text: string): Literal {
            return text === '' ? Literal.Empty : new Literal(text)
        }

        count(): number { return 1 }
        deep_equals_impl(n: Literal): boolean { return this.text === n.text }
        generate(): string[] { return [this.text] }
    }

    class Sequence extends NodeWithElements {
        constructor(terms: Node[]) { super(terms) }
        count(): number { return this.elements.reduce((acc, t) => acc * t.count(), 1) }
        generate(): string[] {
            let words: string[] = []
            for (const term of this.elements) {
                const term_words = term.generate()
                if (words.length === 0) words = term_words
                else words = words.flatMap(w => term_words.map(tw => w + tw))
            }
            return words
        }
    }

    let error_dialog: ErrorDialog
    let confirm_dialog: ConfirmDialog
    let classes_str = Persist('wordgen.classes', '', true)
    let phontactics = Persist('wordgen.phono', '', true)
    let output: string = $state('')
    let word_count: string | null = $derived.by(() => {
        try {
            const res = Parse()
            return '' + res.count()
        } catch (_) { return null }
    })

    function ArraysEqual<T>(ta: T[], tb: T[], pred: (a: T, b: T) => boolean): boolean {
        if (ta.length != tb.length) return false
            for (let i = 0; i < ta.length; i++)
                if (!pred(ta[i], tb[i]))
                    return false
            return true
    }

    function Download() {
        DownloadURL('words.txt', URL.createObjectURL(new Blob([output], {type: 'text/plain'})))
    }

    function Generate() {
        try {
            const parse_tree = Parse()
            if (parse_tree.count() < 100_000) DoIt()
            else confirm_dialog.open().and(DoIt)

            // Unique words here since our deduplication algorithms aren’t perfect.
            function DoIt() { output = [...new Set(parse_tree.generate())].join('\n') }
        } catch (e: any) {
            error_dialog.open(e)
        }
    }

    // Parse the classes and phonotactics.
    //
    // This operation is very cheap, so we can afford to do this every
    // time the classes or phonotactics input changes.
    //
    // This (as well as helper functions used to create some of the node
    // types) also perform a canonicalization pass on both inputs.
    //
    // The goal of the canonicalisation pass is to ensure the word count is
    // accurate since e.g. representing ‘(())’ as two nested optionals would
    // return a possible word count of 3, even though the ‘3’ possibilities
    // are ‘nothing’ or ‘nothing’ or ‘nothing’. This also prevents us from
    // emitting the same word multiple times.
    //
    // Because JS doesn’t support implicit member access, writing this
    // as a function rather than a class is literally more ergonomic...
    function Parse(): Node {
        if (phontactics.value.length === 0) return Literal.Empty

        // Parse classes.
        const classes = ParseClasses()
        const literal_delimiters = ['[', ']', '(', ')', '|', ...classes.keys()].join('')

        // Parse phonotactics.
        const s = Stream(phontactics.value.trim().normalize("NFC"))
        return ParsePattern()

        function IsAlnum(s: string) {
            return s.match(/^[a-zA-Z0-9]+$/)
        }

        // <alternates> ::= <sequence> { '|' <sequence> }
        function ParseAlternates(keep_empty: boolean = true): Node {
            let a: Node[] = []
            do a.push(ParseSequence())
            while (s.consume('|'))
            return Alternates.Make(a, keep_empty)
        }

        // Helper used by ParseGroup() and ParseOptional()
        function ParseAlternatesDelimited(start: string, end: string, keep_empty: boolean = true): Node {
            if (!s.consume(start)) throw Error('Invalid parser state')
            const a = ParseAlternates(keep_empty)
            if (!s.consume(end)) throw Error(`Missing '${end}'`)
            return a
        }

        // <classes> ::= <class> { "\n" <class> }
        // <class>   ::= LETTER "=" <chars> { "," <chars> }
        function ParseClasses(): Classes {
            const classes = new Map<string, string[]>()
            for (const line of Stream(classes_str.value.normalize("NFC")).split('\n').map(l => l.trim()).filter(l => !l.empty())) {
                // Parse name.
                const name = line.take_until_any(" \t\n\v\f=")
                if (name.length !== 1 || !IsAlnum(name))
                    throw new Error("Class name must be a single letter or digit")
                if (classes.has(name))
                    throw new Error(`A class with name '${name}' is already defined`)

                // Yeet '='.
                if (!line.trim_front().consume('='))
                    throw new Error("Expected '=' after class name")

                // Add elements and handle nested classes.
                const elements: string[] = []
                for (const val of line.split(',').map(l => l.trim()).filter(l => !l.empty()).map(s => s.text())) {
                    if (elements.includes(val)) continue
                    if (classes.has(val)) elements.push(...classes.get(val)!!)
                    else elements.push(val)
                }

                // Parse chars.
                classes.set(name, elements)
            }
            return classes
        }

        // <group> ::= "[" <alternates> "]"
        function ParseGroup(): Node { return ParseAlternatesDelimited('[', ']') }

        // <literal> ::= <char> { <char> }
        function ParseLiteral(): Node {
            const val = s.take_until_any(literal_delimiters)
            if (val.length === 0) return Literal.Empty
            return Literal.Of(val)
        }

        // <optional> ::= "(" <alternates> ")"
        function ParseOptional(): Node {
            const a = ParseAlternatesDelimited('(', ')', false)
            return Alternates.Make([Literal.Empty, a], true)
        }

        // <pattern> ::= <alternates>
        function ParsePattern(): Node {
            let root = ParseAlternates()
            if (!s.empty()) throw Error(`Invalid trailing characters in phonotactics: ${s.text()}`)

            // Ignore top-level empty elements.
            if (root instanceof Alternates) root = Alternates.Make(root.elements, false)
            return root
        }

        // <sequence> ::= <term> { <term> }
        function ParseSequence(): Node {
            let seq: Node[] = []
            while (!s.empty() && !s.starts_with_any('])|')) seq.push(ParseTerm())

            // Filter out empty elements and canonicalise structure.
            seq = seq.filter(s => !s.empty())
            if (seq.length === 0) return Literal.Empty
            if (seq.length === 1) return seq[0]
            return new Sequence(seq)
        }

        // <term> ::= <literal> | <class> | <optional> | <group>
        // <class> ::= LETTER
        function ParseTerm(): Node {
            if (s.starts_with('(')) return ParseOptional()
            if (s.starts_with('[')) return ParseGroup()
            if (!s.empty()) {
                const cls = classes.get(s.front()!!)
                if (cls) {
                    s.drop()
                    return Alternates.Make(cls!!.map(Literal.Of), false)
                }
            }
            return ParseLiteral()
        }

        // Unique a list of strings.
        function Unique(s: string[]): string[] {
            const seen = new Set<string>()
            return s.filter(e => {
                if (seen.has(e)) return false
                seen.add(e)
                return true
            })
        }
    }
</script>

<ErrorDialog bind:this={error_dialog} />
<ConfirmDialog
    bind:this={confirm_dialog}
    title='Generate Words?'
    description='You are about to generate {word_count} words. Continue?'
/>

<Page name='Word Generator'></Page>
<Stripe>Word Generator</Stripe>
<section>
    <div>
        <h3>Classes</h3>
        <p>
            Classes are defined on a single line by writing <code>class-name = foo, bar, ...</code>, where <code>class-name</code>
            consists of <strong>exactly one character</strong>, and <code>foo</code>, <code>bar</code>, <code>...</code> are comma-separated
            sequences of arbitrary characters.
        </p>
        <p>Examples:</p>
<pre>
C = t, k
s = sn, st, sp
7 = asdf, 42
</pre>

        <h3>Phonotactics</h3>
        <p>
            The syntax for phonotactics consists of the following elements:
        </p>
        <ul class='pl-8'>
            <li>
                Parentheses enclose optional elements, e.g. <code>(X)</code> means ‘either <code>X</code> or
                nothing’. Note that <code>X</code> can be arbitrarily complex, e.g. <code>(X(Y))</code> means ‘either <code>X</code>
                or <code>XY</code> or nothing’.
            </li>
            <li>
                Vertical bars separate alternates; note that they are only supported within brackets: e.g. <code>(X|Y)</code>
                means ‘either <code>X</code> or <code>Y</code> or nothing’ (the astute may notice that this is entirely equivalent
                to writing <code>[X|Y|]</code>; see below).
            </li>
            <li>
                If you want to preclude the ‘or nothing’ case, use square brackets instead of parentheses, e.g. <code>[X|Y]</code> means
                ‘either <code>X</code> or <code>Y</code>’. While square brackets can also be used without the vertical bar, they
                are simply ignored in that case, so there isn’t really much of a point to it: e.g. <code>[X]</code> is equivalent
                to just <code>X</code>.
            </li>
            <li>
                Any other non-whitespace character (except <code>=</code>) can be defined as a class name (recall that class names are
                always single characters); for some class <code>C</code>
                defined as <code>C = a, b, c</code>, using its class name <code>C</code> in the phonotactics section is equivalent to
                writing <code>[a|b|c]</code>, e.g. <code>tC</code> can generate <code>ta</code>, <code>tb</code>, and <code>tc</code>.
            </li>
            <li>
                Lastly, any character that isn’t a class name or one of <code>()[]|</code> is treated literally, e.g. if <code>t</code>
                is not defined as a class, then it will insert a literal <code>t</code>. Naturally, you can use literal characters in
                conjunction with the features listed above, e.g. <code>s[n|t|p]</code> will generate <code>sn</code>, <code>st</code>,
                and <code>sp</code> (assuming none of these characters are class names).
            </li>
        </ul>

        <h3>Generator</h3>
        <p>
            Press ‘Generate’ to generate all possible words, pressing ‘Download’ afterwards downloads the word, and pressing
            ‘Clear’ clears the output (but not the classes or phonotactics). The approximate number of words that will
            be generated from your input is shown in the bottom left (this number is usually exact, but there are edge cases where
            the computation fails). Note that irrespective of the count shown, this generator will always manage to compute all
            possible words.
        </p>
    </div>
    <div class='grid grid-cols-2 gap-8 mt-4 min-h-[50vh]'>
        <div class='h-full flex flex-col'>
            <div class='textbox flex-grow'>
                <label>Classes</label>
                <textarea bind:value={classes_str.value} name='classes' autocorrect='off' placeholder='C = p, t, k{"\n"}V = a, e, i, o'></textarea>
            </div>

            <div class='textbox mt-8'>
                <label>Phonotactics</label>
                <input bind:value={phontactics.value} type='text' name='input' placeholder='(C)VCV(V)'>
            </div>
        </div>
        <div class='textbox'>
            <label>Words</label>
            <textarea bind:value={output} class='h-full' name='classes' autocorrect='off' readonly></textarea>
        </div>
    </div>
    <div class='flex justify-between items-center mt-8 gap-8'>
        <div>
            <p>Possible Words ≈ {word_count ?? '<ERROR>'}</p>
        </div>
        <div class='flex items-center gap-8 [&>button]:w-32'>
            <button onclick={Generate}>Generate</button>
            <button onclick={Download} disabled={output.length === 0}>Download</button>
            <button onclick={() => output = ''} disabled={output.length === 0}>Clear</button>
        </div>
    </div>
</section>

<style lang='scss'>
    code, pre { color: var(--accentdarker); }
    .textbox {
        display: flex;
        flex-direction: column;
        background: var(--accentlight);
        color: var(--accentdarker);
    }

    label {
        padding-inline: 2px;
        user-select: none;
    }

    textarea, input[type=text] {
        flex-grow: 1;
        border: 1px solid var(--accentlight);
        color: revert;
        padding: 2px;
        font-family: CharisSIL, Doulos SIL, Times New Roman, serif;
    }

</style>