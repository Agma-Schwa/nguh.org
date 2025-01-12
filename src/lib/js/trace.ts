export var max_depth = 15

export class HandledError extends Error {
    constructor(cause?: Error) {
        super('User should not see this.\n' +
            'This should only appear in the browser console.\n' +
            'If you can see this, please report it as a bug', {cause});
    }
}

// UserErrors behave just like Errors, except that their stack traces are
// not shown to the user when calling Dialog.error().
export class UserError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, UserError.prototype);
    }
}

/** Format an Error so that it can be displayed in a dialog */
export function FormatError(e: Error): string {
    /// Format it as a table.
    let stack = FormatStackTrace(e.stack, 'td')
    let table = `<table class="stack-trace"><tbody>${stack.split('\n').map(r => `<tr>${r}</tr>`).join('\n')}</tbody></table>`

    return `<p class="stack-trace-text">${e.message}</p>${table}<p class="stack-trace-info">Check the console for more information.</p>`
        + `<p>If you think that this is a bug, please take a screenshot and report it <a href="https://github.com/Agma-Schwa/nguh.org/issues">here</a></p>`
}

export function FormatStackTrace(trace: string | undefined, field_separator: string = 'span'): string {
    if (!trace) return ''

    /// Split into rows
    let rows = trace.split('\n').filter(x => x.trim().length)
    let len = rows.length

    /// Take only the first `max_depth` so it doesn't overflow the screen.
    if (len > max_depth) rows.slice(0, max_depth)

    /// Determine what format we're working with. If possible, use the second
    /// row since the first row sometimes contains the error message.
    let formatter: (s: string, separator: string) => string
    let row = rows.length > 1 ? rows[1] : rows[0]
    if (row.includes('@')) formatter = FormatStackTraceFirefox
    else {
        if (rows[0].includes('Error:')) rows.shift()
        formatter = FormatStackTraceV8
    }

    /// Format the rows.
    rows = rows.map(r => formatter(r, field_separator))
    return rows.join('\n')
}

interface StackTraceRow {
    func: string,
    file: string,
    line: string,
    col: string
}

/** Format a stack trace once it has been parsed */
export function FormatStackTraceRow(row: StackTraceRow, sep: string = 'span'): string {
    const s = (cl: string) => `<${sep} class="stack-trace-${cl}">`
    const e = `</${sep}>`

    return `${s('func')}${row.func}${e}${s('file')}${row.file}${e}${s('line')}${row.line === '' ? '???' : row.line}${row.col === '' ? '' : `:${row.col}`}${e}`
}

/** Format: FUNCTION@FILE:LINE:COL  */
function FormatStackTraceFirefox(row: string, field_separator: string = 'span'): string {
    /// Simplify the row format.
    if (row.startsWith('async*')) row = row.replace('async*', '<async> ')
    row = row.replaceAll('/<', '')
    row = row.replaceAll('*', '::')
    if (row.startsWith('@')) row = '&lt;anonymous&gt;' + row
    row = SimplifyFilename(row)

    /// Function.
    let ptr = 0
    while (ptr < row.length && row[ptr++] !== '@') ;
    const func = row.slice(0, ptr - 1)
    const func_end = ptr++; /// Yeet '@'

    /// File.
    while (ptr < row.length && row[ptr++] !== ':') ;
    const file = row.slice(func_end, ptr - 1)
    const file_end = ptr /// Yeet ':'

    /// Line.
    while (ptr < row.length && row[ptr++] !== ':') ;
    const line = row.slice(file_end, ptr - 1)
    const line_end = ptr /// Yeet ':'

    /// Col.
    const col = row.slice(line_end)
    return FormatStackTraceRow({func, file, line, col}, field_separator)
}

/**
 * Format:
 * <row>      ::= "at" SPACE <function> SPACE "(" <file-ref> ")"
 *              | "at" SPACE "async" <file-ref>
 *
 * <file-ref> ::= <file> ":" <line> ":" <col>
 *              | "<anonymous>"
 */
function FormatStackTraceV8(row: string, field_separator: string = 'span'): string {
    if (row.includes('<anonymous>')) {
        /// Func.
        let ptr = row.indexOf('at ') + 3
        const func_start = ptr
        while (ptr < row.length && row[ptr++] !== ' ') ;
        let func = row.slice(func_start, ptr)
        if (func.trim() == 'async') func = '&lt;async&gt;'

        return FormatStackTraceRow({func, file: '&lt;anonymous&gt;', line: '', col: ''}, field_separator)
    } else {
        row = SimplifyFilename(row)

        /// Func.
        let ptr = row.indexOf('at ') + 3
        const func_start = ptr
        while (ptr < row.length && row[ptr++] !== ' ') ;
        let func = row.slice(func_start, ptr)
        if (func.trim() == 'async') func = '&lt;async&gt;'

        /// File.
        if (func !== '&lt;async&gt;') while (ptr < row.length && row[ptr++] !== '(') ;
        const file_start = ptr
        if (ptr < row.length) ptr++
        while (ptr < row.length && row[ptr++] !== ':') ;
        const file = row.slice(file_start, ptr - 1)
        const file_end = ptr++

        /// Line.
        while (ptr < row.length && row[ptr++] !== ':') ;
        const line = row.slice(file_end, ptr - 1)
        const line_end = ptr /// Yeet ':'

        /// Col.
        const col = func !== '&lt;async&gt;' ? row.slice(line_end, -1) : row.slice(line_end)
        return FormatStackTraceRow({func, file, line, col}, field_separator)
    }
}

function SimplifyFilename(file: string): string {
    return file.replaceAll(/https?:\/\/.*\/([^?]*)(\?v=\d+)?/g, '$1')
}