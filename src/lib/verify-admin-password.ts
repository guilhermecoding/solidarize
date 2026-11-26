import "server-only";

import { headers } from "next/headers";
import { APIError } from "better-auth/api";

import { serverFailure, serverSuccess, type ServerResponse } from "@/@types/server-response";
import { auth } from "@/lib/auth";
import {
    VERIFY_PASSWORD_POLICY,
    checkRateLimit,
    clearRateLimit,
    formatRetryAfterPtBr,
    recordRateLimitFailure,
} from "@/lib/rate-limit";
import { recordAuditLog } from "@/services/audit/audit.service";

export type PasswordVerificationActor = {
    id: string;
    name: string;
};

/**
 * Valida a senha do administrador autenticado antes de executar ações destrutivas,
 * aplicando limite de tentativas persistente e registro em auditoria.
 */
export async function verifyAdminPassword(
    password: string,
    actor?: PasswordVerificationActor,
): Promise<ServerResponse> {
    const requestHeaders = await headers();
    const resolvedActor = actor ?? await resolveSessionActor(requestHeaders);
    const rateLimitKey = resolvedActor ? `verify-pw:user:${resolvedActor.id}` : null;

    if (rateLimitKey) {
        const limit = await checkRateLimit(rateLimitKey);

        if (!limit.allowed) {
            return serverFailure(
                `Muitas tentativas incorretas de senha. Aguarde ${formatRetryAfterPtBr(limit.retryAfterSeconds)} e tente novamente.`,
            );
        }
    }

    try {
        await auth.api.verifyPassword({
            body: { password },
            headers: requestHeaders,
        });

        if (rateLimitKey) {
            await clearRateLimit(rateLimitKey);
        }

        return serverSuccess();
    } catch (error) {
        if (error instanceof APIError) {
            if (readErrorCode(error) === "INVALID_PASSWORD") {
                if (rateLimitKey && resolvedActor) {
                    const failure = await recordRateLimitFailure(rateLimitKey, VERIFY_PASSWORD_POLICY);

                    await recordAuditLog({
                        action: "auth.verify_password_failed",
                        entityType: "auth",
                        entityId: resolvedActor.id,
                        entityLabel: resolvedActor.name,
                        description: "Senha incorreta ao confirmar ação administrativa",
                        actorId: resolvedActor.id,
                        actorName: resolvedActor.name,
                        headers: requestHeaders,
                    });

                    if (!failure.allowed) {
                        return serverFailure(
                            `Muitas tentativas incorretas de senha. Aguarde ${formatRetryAfterPtBr(failure.retryAfterSeconds)} e tente novamente.`,
                        );
                    }
                }

                return serverFailure("Senha incorreta.");
            }

            return serverFailure("Não foi possível confirmar a senha.");
        }

        throw error;
    }
}

async function resolveSessionActor(
    requestHeaders: Headers,
): Promise<PasswordVerificationActor | null> {
    try {
        const session = await auth.api.getSession({
            headers: requestHeaders,
            query: {
                disableRefresh: true,
            },
        });

        if (!session?.user) {
            return null;
        }

        return {
            id: session.user.id,
            name: session.user.name,
        };
    } catch {
        return null;
    }
}

function readErrorCode(error: APIError): string | null {
    const body = error.body;

    if (!body || typeof body !== "object" || !("code" in body)) {
        return null;
    }

    return typeof body.code === "string" ? body.code : null;
}
