import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isLoginRoute =
        pathname === "/entrar" || pathname.startsWith("/entrar/");
    const isAuthApi = pathname.startsWith("/api/auth");

    if (isAuthApi) {
        return NextResponse.next();
    }

    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (isLoginRoute) {
        if (session) {
            return NextResponse.redirect(new URL("/inicio", request.url));
        }

        return NextResponse.next();
    }

    if (!session) {
        return NextResponse.redirect(new URL("/entrar", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
    ],
};
