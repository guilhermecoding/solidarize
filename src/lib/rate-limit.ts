import "server-only";

import { createHash } from "node:crypto";

import prisma from "@/lib/prisma";
import { logSafeServerError } from "@/lib/safe-log";

export type LockoutTier = {
    threshold: number;
    lockSeconds: number;
};

export type RateLimitPolicy = {
    windowSeconds: number;
    tiers: readonly LockoutTier[];
};

export type RateLimitResult = {
    allowed: boolean;
    retryAfterSeconds: number;
    attempts: number;
};

export const LOGIN_ACCOUNT_POLICY: RateLimitPolicy = {
    windowSeconds: 15 * 60,
    tiers: [
        { threshold: 5, lockSeconds: 5 * 60 },
        { threshold: 8, lockSeconds: 15 * 60 },
        { threshold: 10, lockSeconds: 30 * 60 },
    ],
};

export const LOGIN_IP_POLICY: RateLimitPolicy = {
    windowSeconds: 15 * 60,
    tiers: [{ threshold: 15, lockSeconds: 15 * 60 }],
};

export const VERIFY_PASSWORD_POLICY: RateLimitPolicy = {
    windowSeconds: 15 * 60,
    tiers: [{ threshold: 5, lockSeconds: 15 * 60 }],
};

const STALE_CLEANUP_MS = 24 * 60 * 60 * 1000;

/**
 * Gera um hash SHA-256 irreversível para chaves de rate limit baseadas em identificadores sensíveis.
 */
export function hashRateLimitIdentifier(value: string): string {
    return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

/**
 * Formata o tempo restante de bloqueio em português legível.
 */
export function formatRetryAfterPtBr(retryAfterSeconds: number): string {
    if (retryAfterSeconds < 60) {
        return "menos de 1 minuto";
    }

    const minutes = Math.ceil(retryAfterSeconds / 60);
    return minutes === 1 ? "1 minuto" : `${minutes} minutos`;
}

/**
 * Verifica se uma chave está atualmente bloqueada no banco de dados.
 */
export async function checkRateLimit(key: string): Promise<RateLimitResult> {
    const row = await prisma.securityRateLimit.findUnique({
        where: { key },
        select: {
            attempts: true,
            lockedUntil: true,
        },
    });

    if (!row) {
        return { allowed: true, retryAfterSeconds: 0, attempts: 0 };
    }

    const nowMs = Date.now();
    const lockedUntilMs = row.lockedUntil?.getTime() ?? 0;

    if (lockedUntilMs > nowMs) {
        return {
            allowed: false,
            retryAfterSeconds: Math.max(1, Math.ceil((lockedUntilMs - nowMs) / 1000)),
            attempts: row.attempts,
        };
    }

    return {
        allowed: true,
        retryAfterSeconds: 0,
        attempts: row.attempts,
    };
}

/**
 * Registra uma falha de autenticação/validação e aplica bloqueio progressivo em PostgreSQL.
 */
export async function recordRateLimitFailure(
    key: string,
    policy: RateLimitPolicy,
): Promise<RateLimitResult> {
    const now = new Date();
    const nowMs = now.getTime();
    const windowMs = policy.windowSeconds * 1000;
    let shouldPruneStale = false;

    const result = await prisma.$transaction(async (tx) => {
        const lockedRows = await tx.$queryRaw<Array<{
            key: string;
            attempts: number;
            windowStartAt: Date;
            lockedUntil: Date | null;
        }>>`
            SELECT key, attempts, "windowStartAt", "lockedUntil"
            FROM "system-auth"."security_rate_limit"
            WHERE key = ${key}
            FOR UPDATE
        `;

        const current = lockedRows[0];

        if (!current) {
            shouldPruneStale = true;
            const firstLock = resolveLockDate(1, policy, nowMs);

            await tx.securityRateLimit.create({
                data: {
                    key,
                    attempts: 1,
                    windowStartAt: now,
                    lockedUntil: firstLock,
                },
            });

            return toRateLimitResult(1, firstLock, nowMs);
        }

        const currentLockMs = current.lockedUntil?.getTime() ?? 0;

        if (currentLockMs > nowMs) {
            return toRateLimitResult(current.attempts, current.lockedUntil, nowMs);
        }

        const windowExpired = nowMs - current.windowStartAt.getTime() >= windowMs;
        const nextAttempts = windowExpired ? 1 : current.attempts + 1;
        const nextWindowStartAt = windowExpired ? now : current.windowStartAt;
        const nextLockedUntil = resolveLockDate(nextAttempts, policy, nowMs);

        if (windowExpired) {
            shouldPruneStale = true;
        }

        await tx.securityRateLimit.update({
            where: { key },
            data: {
                attempts: nextAttempts,
                windowStartAt: nextWindowStartAt,
                lockedUntil: nextLockedUntil,
            },
        });

        return toRateLimitResult(nextAttempts, nextLockedUntil, nowMs);
    });

    if (shouldPruneStale) {
        const cutoff = new Date(nowMs - STALE_CLEANUP_MS);
        await prisma.securityRateLimit
            .deleteMany({
                where: {
                    updatedAt: { lt: cutoff },
                },
            })
            .catch((error) => {
                logSafeServerError("rate-limit-prune", error);
            });
    }

    return result;
}

/**
 * Remove o histórico de falhas de uma chave após autenticação bem-sucedida.
 */
export async function clearRateLimit(key: string): Promise<void> {
    await prisma.securityRateLimit.deleteMany({
        where: { key },
    });
}

function resolveLockDate(
    attempts: number,
    policy: RateLimitPolicy,
    nowMs: number,
): Date | null {
    let lockSeconds = 0;

    for (const tier of policy.tiers) {
        if (attempts >= tier.threshold && tier.lockSeconds > lockSeconds) {
            lockSeconds = tier.lockSeconds;
        }
    }

    return lockSeconds > 0 ? new Date(nowMs + lockSeconds * 1000) : null;
}

function toRateLimitResult(
    attempts: number,
    lockedUntil: Date | null,
    nowMs: number,
): RateLimitResult {
    const lockedUntilMs = lockedUntil?.getTime() ?? 0;

    if (lockedUntilMs > nowMs) {
        return {
            allowed: false,
            retryAfterSeconds: Math.max(1, Math.ceil((lockedUntilMs - nowMs) / 1000)),
            attempts,
        };
    }

    return {
        allowed: true,
        retryAfterSeconds: 0,
        attempts,
    };
}
