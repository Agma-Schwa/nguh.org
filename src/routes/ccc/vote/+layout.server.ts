import { redirect } from "@sveltejs/kit";

export const load = async (event) => {
    const session = await event.locals.auth();
    if (!session) throw redirect(307, "/ccc/login");
    return { session }
}