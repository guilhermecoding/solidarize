import "server-only";

import { cacheLife } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export type CurrentUser = {
    id: string;
    name: string;
    email: string;
    avatar: string;
};

export async function getCurrentUser(): Promise<CurrentUser> {
    "use cache: private";
    cacheLife("minutes");

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/entrar");
    }

    return {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        avatar: session.user.image ?? "",
    };
}
