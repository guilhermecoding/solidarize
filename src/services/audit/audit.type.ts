export const auditCategories = ["all", "member", "beneficiary", "auth"] as const;
export type AuditCategory = (typeof auditCategories)[number];

export const auditCategoryLabels: Record<AuditCategory, string> = {
    all: "Todos",
    member: "Membros",
    beneficiary: "Beneficiários",
    auth: "Autenticação",
};

export const auditCategorySlugs = {
    todos: "all",
    membros: "member",
    beneficiarios: "beneficiary",
    autenticacao: "auth",
} as const satisfies Record<string, AuditCategory>;

export const auditCategoryToSlug: Record<AuditCategory, string> = {
    all: "todos",
    member: "membros",
    beneficiary: "beneficiarios",
    auth: "autenticacao",
};

export const auditActions = [
    "member.create",
    "member.update",
    "member.ban",
    "member.unban",
    "member.delete",
    "member.set_password",
    "beneficiary.create",
    "beneficiary.update",
    "beneficiary.delete",
    "auth.login_success",
    "auth.login_failed",
    "auth.login_rate_limited",
    "auth.verify_password_failed",
    "auth.admin_api_blocked",
] as const;

export type AuditAction = (typeof auditActions)[number];

export type AuditEntityType = "user" | "beneficiary" | "auth";
export type AuditSeverity = "info" | "warning" | "danger";

export type AuditLogItemRecord = {
    id: string;
    action: AuditAction;
    actionLabel: string;
    entityType: AuditEntityType;
    entityId: string | null;
    entityLabel: string | null;
    description: string;
    actorName: string;
    ipAddress: string | null;
    severity: AuditSeverity;
    createdAtLabel: string;
    dayKey: string;
    dayLabel: string;
};

export type AuditLogPage = {
    items: AuditLogItemRecord[];
    total: number;
    page: number;
    pageCount: number;
    category: AuditCategory;
};
