import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { isUserBanned } from "@/lib/member-access";

const BLOCKED_AUTH_PREFIXES = [
    "/api/auth/admin",
    "/api/auth/sign-up",
] as const;

const BLOCKED_AUTH_EXACT_PATHS = new Set([
    "/api/auth/update-user",
    "/api/auth/change-email",
    "/api/auth/change-password",
    "/api/auth/delete-user",
]);

function isBlockedAuthApiRoute(pathname: string): boolean {
    if (BLOCKED_AUTH_EXACT_PATHS.has(pathname)) {
        return true;
    }

    return BLOCKED_AUTH_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (isBlockedAuthApiRoute(pathname)) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

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
        headers: await headers(),
        query: {
            disableRefresh: true,
        },
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
