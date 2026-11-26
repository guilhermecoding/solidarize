"use server";

import { revalidatePath, updateTag } from "next/cache";
import { headers } from "next/headers";
import { APIError } from "better-auth/api";

import { serverFailure, serverSuccess } from "@/@types/server-response";
import { auth } from "@/lib/auth";
import {
    LOGIN_ACCOUNT_POLICY,
    LOGIN_IP_POLICY,
    checkRateLimit,
    clearRateLimit,
    formatRetryAfterPtBr,
    hashRateLimitIdentifier,
    recordRateLimitFailure,
} from "@/lib/rate-limit";
import { extractRequestMetadata } from "@/lib/request-meta";
import { actionClient } from "@/lib/safe-action";
import {
    AUDIT_LOG_CACHE_TAG,
    maskEmailForAudit,
    recordAuditLog,
} from "@/services/audit/audit.service";
import { loginSchema } from "./schema";

function refreshAuditFeed() {
    updateTag(AUDIT_LOG_CACHE_TAG);
    revalidatePath("/auditoria");
}

export const loginAction = actionClient
    .inputSchema(loginSchema)
    .action(async ({ parsedInput: { email, password } }) => {
        const requestHeaders = await headers();
        const { ipAddress } = extractRequestMetadata(requestHeaders);
        const normalizedEmail = email.trim().toLowerCase();
        const maskedEmail = maskEmailForAudit(normalizedEmail);
        const ipKey = `login:ip:${ipAddress ?? "unknown"}`;
        const accountKey = `login:account:${hashRateLimitIdentifier(normalizedEmail)}`;

        const [ipCheck, accountCheck] = await Promise.all([
            checkRateLimit(ipKey),
            checkRateLimit(accountKey),
        ]);

        if (!ipCheck.allowed || !accountCheck.allowed) {
            const retryAfterSeconds = Math.max(
                ipCheck.retryAfterSeconds,
                accountCheck.retryAfterSeconds,
            );

            await recordAuditLog({
                action: "auth.login_rate_limited",
                entityType: "auth",
                entityLabel: maskedEmail,
                description: `Tentativa de login bloqueada por limite de tentativas (${maskedEmail})`,
                actorName: maskedEmail,
                headers: requestHeaders,
            });
            refreshAuditFeed();

            return serverFailure(
                `Muitas tentativas de login. Aguarde ${formatRetryAfterPtBr(retryAfterSeconds)} e tente novamente.`,
            );
        }

        try {
            const result = await auth.api.signInEmail({
                body: { email: normalizedEmail, password },
                headers: requestHeaders,
            });

            await clearRateLimit(accountKey);
            await recordAuditLog({
                action: "auth.login_success",
                entityType: "auth",
                entityId: result.user.id,
                entityLabel: result.user.email,
                description: "Login realizado no sistema",
                actorId: result.user.id,
                actorName: result.user.name,
                headers: requestHeaders,
            });
            refreshAuditFeed();

            return serverSuccess(undefined, "Login realizado com sucesso.");
        } catch (error) {
            if (error instanceof APIError) {
                const [ipFailure, accountFailure] = await Promise.all([
                    recordRateLimitFailure(ipKey, LOGIN_IP_POLICY),
                    recordRateLimitFailure(accountKey, LOGIN_ACCOUNT_POLICY),
                ]);

                await recordAuditLog({
                    action: "auth.login_failed",
                    entityType: "auth",
                    entityLabel: maskedEmail,
                    description: `Falha de login para ${maskedEmail}`,
                    actorName: maskedEmail,
                    headers: requestHeaders,
                });
                refreshAuditFeed();

                if (!ipFailure.allowed || !accountFailure.allowed) {
                    const retryAfterSeconds = Math.max(
                        ipFailure.retryAfterSeconds,
                        accountFailure.retryAfterSeconds,
                    );

                    return serverFailure(
                        `Muitas tentativas de login. Aguarde ${formatRetryAfterPtBr(retryAfterSeconds)} e tente novamente.`,
                    );
                }

                return serverFailure("E-mail ou senha inválidos.");
            }

            throw error;
        }
    });
