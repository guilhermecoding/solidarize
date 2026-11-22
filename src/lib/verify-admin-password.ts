import "server-only";

import { headers } from "next/headers";
import { APIError } from "better-auth/api";

import { serverFailure, serverSuccess, type ServerResponse } from "@/@types/server-response";
import { auth } from "@/lib/auth";

/**
 * Valida a senha do administrador autenticado antes de executar ações destrutivas.
 */
export async function verifyAdminPassword(password: string): Promise<ServerResponse> {
    const requestHeaders = await headers();

    try {
        await auth.api.verifyPassword({
            body: { password },
            headers: requestHeaders,
        });

        return serverSuccess();
    } catch (error) {
        if (error instanceof APIError) {
            if (readErrorCode(error) === "INVALID_PASSWORD") {
                return serverFailure("Senha incorreta.");
            }

            return serverFailure("Não foi possível confirmar a senha.");
        }

        throw error;
    }
}

function readErrorCode(error: APIError): string | null {
    const body = error.body;

    if (!body || typeof body !== "object" || !("code" in body)) {
        return null;
    }

    return typeof body.code === "string" ? body.code : null;
}
