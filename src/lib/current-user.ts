import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { isUserBanned } from "@/lib/member-access";
import { USER_CACHE_TAG } from "@/services/user/user.service";

export type CurrentUser = {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
    permission: string;
};

export async function getCurrentUser(): Promise<CurrentUser> {
    "use cache: private";
    cacheTag(USER_CACHE_TAG);
    cacheLife({ stale: 30, revalidate: 30, expire: 60 });

    const session = await auth.api.getSession({
        headers: await headers(),
        query: {
            disableRefresh: true,
        },
    });

    if (!session?.user || isUserBanned(session.user)) {
        redirect("/entrar");
    }

    return {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        avatar: session.user.image ?? "",
        role: session.user.role ?? "member",
        permission: session.user.permission ?? "read",
    };
}
