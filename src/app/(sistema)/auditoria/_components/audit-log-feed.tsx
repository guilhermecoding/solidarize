import Link from "next/link";
import {
    Alert02Icon,
    ArrowLeft01Icon,
    ArrowRight01Icon,
    Audit02Icon,
    Delete03Icon,
    Key01Icon,
    Login01Icon,
    SecurityLockIcon,
    UserAdd01Icon,
    UserEdit01Icon,
    UserRemove01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    auditCategories,
    auditCategoryLabels,
    auditCategoryToSlug,
    type AuditAction,
    type AuditCategory,
    type AuditLogItemRecord,
    type AuditLogPage,
    type AuditSeverity,
} from "@/services/audit/audit.type";

type AuditLogFeedProps = {
    data: AuditLogPage;
};

type DayGroup = {
    key: string;
    label: string;
    items: AuditLogItemRecord[];
};

const ACTION_ICON: Record<AuditAction, typeof Audit02Icon> = {
    "member.create": UserAdd01Icon,
    "member.update": UserEdit01Icon,
    "member.ban": UserRemove01Icon,
    "member.unban": UserAdd01Icon,
    "member.delete": Delete03Icon,
    "member.set_password": Key01Icon,
    "beneficiary.create": UserAdd01Icon,
    "beneficiary.update": UserEdit01Icon,
    "beneficiary.delete": Delete03Icon,
    "auth.login_success": Login01Icon,
    "auth.login_failed": Alert02Icon,
    "auth.login_rate_limited": SecurityLockIcon,
    "auth.verify_password_failed": Key01Icon,
    "auth.admin_api_blocked": SecurityLockIcon,
};

const SEVERITY_ICON_BG: Record<AuditSeverity, string> = {
    info: "bg-emerald-600",
    warning: "bg-amber-600",
    danger: "bg-red-600",
};

function buildHref(category: AuditCategory, page?: number): string {
    const params = new URLSearchParams();

    if (category !== "all") {
        params.set("categoria", auditCategoryToSlug[category]);
    }

    if (page && page > 1) {
        params.set("pagina", String(page));
    }

    const query = params.toString();
    return query ? `/auditoria?${query}` : "/auditoria";
}

/**
 * Lista agrupada por dia e paginada com filtros por categoria para eventos de auditoria.
 */
export function AuditLogFeed({ data }: AuditLogFeedProps) {
    const groups = groupByDay(data.items);

    return (
        <div className="flex flex-col gap-6">
            <nav aria-label="Filtrar eventos por categoria" className="flex flex-wrap gap-2">
                {auditCategories.map((category) => {
                    const isActive = data.category === category;

                    return (
                        <Button
                            key={category}
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            nativeButton={false}
                            className={cn(!isActive && "border-foreground/20")}
                            render={<Link href={buildHref(category)} />}
                        >
                            {auditCategoryLabels[category]}
                        </Button>
                    );
                })}
            </nav>

            {data.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border bg-card py-16 text-center text-muted-foreground">
                    <HugeiconsIcon icon={Audit02Icon} strokeWidth={2} className="size-10" />
                    <div className="flex flex-col gap-1">
                        <p className="text-base font-semibold text-foreground">
                            Nenhum evento registrado
                        </p>
                        <p className="text-sm">
                            As ações administrativas e eventos de acesso aparecerão aqui.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-6">
                        {groups.map((group) => (
                            <section key={group.key} className="flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-sm font-semibold text-muted-foreground">
                                        {group.label}
                                    </h2>
                                    <span className="h-px flex-1 bg-border" />
                                </div>
                                <ul className="flex flex-col gap-3">
                                    {group.items.map((item) => {
                                        const icon = ACTION_ICON[item.action];

                                        return (
                                            <li key={item.id}>
                                                <article className="flex items-center gap-4 rounded-2xl border bg-card p-4 text-card-foreground">
                                                    <span
                                                        className={cn(
                                                            "flex size-10 shrink-0 items-center justify-center rounded-full text-white",
                                                            SEVERITY_ICON_BG[item.severity],
                                                        )}
                                                    >
                                                        <HugeiconsIcon
                                                            icon={icon}
                                                            strokeWidth={2}
                                                            className="size-5"
                                                        />
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <p className="text-sm font-semibold sm:text-base">
                                                                {item.description}
                                                            </p>
                                                            <Badge variant="muted">{item.actionLabel}</Badge>
                                                            {item.entityLabel ? (
                                                                <Badge variant="outline">{item.entityLabel}</Badge>
                                                            ) : null}
                                                        </div>
                                                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                                                            <span>{item.createdAtLabel}</span>
                                                            <span aria-hidden="true">•</span>
                                                            <span>{item.actorName}</span>
                                                            {item.ipAddress ? (
                                                                <>
                                                                    <span aria-hidden="true">•</span>
                                                                    <span>IP {item.ipAddress}</span>
                                                                </>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </article>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </section>
                        ))}
                    </div>

                    {data.total > 0 ? (
                        <div className="flex items-center justify-between gap-4 border-t pt-4">
                            <span className="text-sm text-muted-foreground">
                                Página {data.page} de {data.pageCount}
                            </span>
                            <div className="flex items-center gap-1">
                                {data.page > 1 ? (
                                    <Button
                                        variant="outline"
                                        size="icon-sm"
                                        nativeButton={false}
                                        className="border-foreground/20"
                                        aria-label="Página anterior"
                                        render={
                                            <Link href={buildHref(data.category, data.page - 1)} />
                                        }
                                    >
                                        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon-sm"
                                        className="border-foreground/20"
                                        aria-label="Página anterior"
                                        disabled
                                    >
                                        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
                                    </Button>
                                )}
                                {data.page < data.pageCount ? (
                                    <Button
                                        variant="outline"
                                        size="icon-sm"
                                        nativeButton={false}
                                        className="border-foreground/20"
                                        aria-label="Próxima página"
                                        render={
                                            <Link href={buildHref(data.category, data.page + 1)} />
                                        }
                                    >
                                        <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon-sm"
                                        className="border-foreground/20"
                                        aria-label="Próxima página"
                                        disabled
                                    >
                                        <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}

function groupByDay(items: AuditLogItemRecord[]): DayGroup[] {
    const groups: DayGroup[] = [];

    for (const item of items) {
        const last = groups[groups.length - 1];

        if (last && last.key === item.dayKey) {
            last.items.push(item);
            continue;
        }

        groups.push({
            key: item.dayKey,
            label: item.dayLabel,
            items: [item],
        });
    }

    return groups;
}
