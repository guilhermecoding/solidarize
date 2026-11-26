import type { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { getRequestMetadata } from "@/lib/request-meta";
import { logSafeServerError } from "@/lib/safe-log";
import type { AuditAction, AuditEntityType } from "@/services/audit/audit.type";

export type AuditMetadataValue = string | number | boolean | string[] | null;

export type RecordAuditLogInput = {
    action: AuditAction;
    entityType: AuditEntityType;
    entityId?: string | null;
    entityLabel?: string | null;
    description: string;
    actorId?: string | null;
    actorName: string;
    metadata?: Record<string, AuditMetadataValue>;
    headers?: Headers;
};

/**
 * Mascara um endereço de e-mail para exibição segura em trilhas de auditoria.
 */
export function maskEmailForAudit(email: string): string {
    const trimmed = email.trim().toLowerCase();
    const atIndex = trimmed.indexOf("@");

    if (atIndex <= 0) {
        return "***";
    }

    const local = trimmed.slice(0, atIndex);
    const domain = trimmed.slice(atIndex);
    const visibleChars = Math.min(2, local.length);

    return `${local.slice(0, visibleChars)}***${domain}`;
}

/**
 * Registra um evento na trilha de auditoria sem interromper a operação principal caso ocorra erro de gravação.
 */
export async function recordAuditLog(input: RecordAuditLogInput): Promise<void> {
    try {
        const { ipAddress, userAgent } = await getRequestMetadata(input.headers);
        const metadata = sanitizeMetadata(input.metadata);

        await prisma.auditLog.create({
            data: {
                action: input.action,
                entityType: input.entityType,
                entityId: input.entityId ?? null,
                entityLabel: input.entityLabel ?? null,
                description: input.description,
                actorId: input.actorId ?? null,
                actorName: input.actorName,
                ipAddress,
                userAgent,
                ...(metadata !== undefined ? { metadata } : {}),
            },
        });
    } catch (error) {
        logSafeServerError("audit-log", error);
    }
}

function sanitizeMetadata(
    metadata?: Record<string, AuditMetadataValue>,
): Prisma.InputJsonObject | undefined {
    if (!metadata) {
        return undefined;
    }

    const safe: Record<string, Prisma.InputJsonValue | null> = {};

    for (const [key, value] of Object.entries(metadata)) {
        if (value === undefined) {
            continue;
        }

        safe[key] = value;
    }

    return Object.keys(safe).length > 0 ? (safe as Prisma.InputJsonObject) : undefined;
}
