import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { isUserBanned } from "@/lib/member-access";

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isLoginRoute =
        pathname === "/entrar" || pathname.startsWith("/entrar/");
    const isAuthApi = pathname.startsWith("/api/auth");
    const isPublicPwaRoute =
        pathname === "/~offline"
        || pathname === "/manifest.webmanifest"
        || pathname === "/sw.js";

    if (isAuthApi || isPublicPwaRoute) {
        return NextResponse.next();
    }

    const session = await auth.api.getSession({
        headers: await headers()
    });
    const hasValidSession = Boolean(session?.user && !isUserBanned(session.user));

    if (isLoginRoute) {
        if (hasValidSession) {
            return NextResponse.redirect(new URL("/", request.url));
        }

        return NextResponse.next();
    }

    if (!hasValidSession) {
        return NextResponse.redirect(new URL("/entrar", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|manifest\\.webmanifest|sw\\.js|swe-worker-.*\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
    ],
};
