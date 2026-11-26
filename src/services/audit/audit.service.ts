import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import type { Prisma } from "@/generated/prisma/client";
import { formatDateTimeBr, getBrazilDateKey, getHistoryDayGroup } from "@/lib/date-br";
import prisma from "@/lib/prisma";
import {
    auditActions,
    type AuditAction,
    type AuditCategory,
    type AuditEntityType,
    type AuditLogItemRecord,
    type AuditLogPage,
    type AuditSeverity,
} from "@/services/audit/audit.type";

export {
    maskEmailForAudit,
    recordAuditLog,
    type AuditMetadataValue,
    type RecordAuditLogInput,
} from "@/services/audit/audit-writer";

export const AUDIT_LOG_CACHE_TAG = "audit-logs";

const DEFAULT_AUDIT_PAGE_SIZE = 20;

const ACTION_LABELS: Record<AuditAction, string> = {
    "member.create": "Membro criado",
    "member.update": "Membro atualizado",
    "member.ban": "Acesso desativado",
    "member.unban": "Acesso reativado",
    "member.delete": "Membro excluído",
    "member.set_password": "Senha redefinida",
    "beneficiary.create": "Beneficiário criado",
    "beneficiary.update": "Beneficiário atualizado",
    "beneficiary.delete": "Beneficiário excluído",
    "auth.login_success": "Login realizado",
    "auth.login_failed": "Falha de login",
    "auth.login_rate_limited": "Login bloqueado",
    "auth.verify_password_failed": "Senha incorreta",
    "auth.admin_api_blocked": "Acesso bloqueado",
};

const ACTION_SEVERITY: Record<AuditAction, AuditSeverity> = {
    "member.create": "info",
    "member.update": "info",
    "member.ban": "warning",
    "member.unban": "info",
    "member.delete": "danger",
    "member.set_password": "warning",
    "beneficiary.create": "info",
    "beneficiary.update": "info",
    "beneficiary.delete": "danger",
    "auth.login_success": "info",
    "auth.login_failed": "warning",
    "auth.login_rate_limited": "danger",
    "auth.verify_password_failed": "warning",
    "auth.admin_api_blocked": "danger",
};

/**
 * Lista a trilha de auditoria paginada e filtrada por categoria para consulta administrativa.
 */
export async function listAuditLogsPage({
    page,
    pageSize = DEFAULT_AUDIT_PAGE_SIZE,
    category = "all",
}: {
    page: number;
    pageSize?: number;
    category?: AuditCategory;
}): Promise<AuditLogPage> {
    "use cache";
    cacheTag(AUDIT_LOG_CACHE_TAG);
    cacheLife("minutes");

    const referenceDateKey = getBrazilDateKey(new Date());
    const entityTypeFilter = categoryToEntityType(category);
    const where: Prisma.AuditLogWhereInput = entityTypeFilter
        ? { entityType: entityTypeFilter }
        : {};

    const total = await prisma.auditLog.count({ where });
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(Math.max(1, page), pageCount);

    const rows = await prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
        select: {
            id: true,
            action: true,
            entityType: true,
            entityId: true,
            entityLabel: true,
            description: true,
            actorName: true,
            ipAddress: true,
            createdAt: true,
        },
    });

    const items: AuditLogItemRecord[] = rows.map((row) => {
        const action = toAuditAction(row.action);
        const dayGroup = getHistoryDayGroup(row.createdAt, referenceDateKey);

        return {
            id: row.id,
            action,
            actionLabel: ACTION_LABELS[action],
            entityType: toAuditEntityType(row.entityType),
            entityId: row.entityId,
            entityLabel: row.entityLabel,
            description: row.description,
            actorName: row.actorName,
            ipAddress: row.ipAddress,
            severity: ACTION_SEVERITY[action],
            createdAtLabel: formatDateTimeBr(row.createdAt),
            dayKey: dayGroup.key,
            dayLabel: dayGroup.label,
        };
    });

    return {
        items,
        total,
        page: currentPage,
        pageCount,
        category,
    };
}

function categoryToEntityType(category: AuditCategory): AuditEntityType | null {
    switch (category) {
        case "member":
            return "user";
        case "beneficiary":
            return "beneficiary";
        case "auth":
            return "auth";
        case "all":
            return null;
    }
}

function toAuditAction(value: string): AuditAction {
    return auditActions.find((item) => item === value) ?? "auth.login_success";
}

function toAuditEntityType(value: string): AuditEntityType {
    if (value === "user" || value === "beneficiary" || value === "auth") {
        return value;
    }

    return "auth";
}
