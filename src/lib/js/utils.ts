export function wrap(status: number): Response {
    return new Response(null, { status: status })
}