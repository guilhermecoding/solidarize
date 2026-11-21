import Link from "next/link";
import {
    ArrowBigDownDashIcon,
    ArrowBigUpDashIcon,
    ArrowLeft01Icon,
    ArrowRight01Icon,
    Clock01Icon,
    ShoppingBasketCheckIn03Icon,
    ShoppingBasketCheckOut03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HistoryItemRecord, HistoryPage } from "@/services/food/food.type";

type HistoryFeedProps = {
    kind: "basket" | "food";
    data: HistoryPage;
    basePath: string;
    emptyTitle: string;
    emptyDescription: string;
};

type DayGroup = {
    key: string;
    label: string;
    items: HistoryItemRecord[];
};

/**
 * Lista agrupada por dia e paginada (10 em 10) de movimentações de cestas ou alimentos.
 */
export function HistoryFeed({
    kind,
    data,
    basePath,
    emptyTitle,
    emptyDescription,
}: HistoryFeedProps) {
    if (data.items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border bg-card py-16 text-center text-muted-foreground">
                <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} className="size-10" />
                <div className="flex flex-col gap-1">
                    <p className="text-base font-semibold text-foreground">{emptyTitle}</p>
                    <p className="text-sm">{emptyDescription}</p>
                </div>
            </div>
        );
    }

    const groups = groupByDay(data.items);
    const inIcon = kind === "basket" ? ShoppingBasketCheckIn03Icon : ArrowBigUpDashIcon;
    const outIcon = kind === "basket" ? ShoppingBasketCheckOut03Icon : ArrowBigDownDashIcon;

    return (
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
                                const isEntry = item.type === "in";
                                const icon = isEntry ? inIcon : outIcon;

                                return (
                                    <li key={item.id}>
                                        <article className="flex items-center gap-4 rounded-2xl border bg-card p-4 text-card-foreground">
                                            <span
                                                className={cn(
                                                    "flex size-10 shrink-0 items-center justify-center rounded-full text-white",
                                                    isEntry ? "bg-emerald-600" : "bg-red-600",
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
                                                        {item.title}
                                                    </p>
                                                    {item.subtitle ? (
                                                        <Badge variant="muted">{item.subtitle}</Badge>
                                                    ) : null}
                                                </div>
                                                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                                                    <span>{item.createdAtLabel}</span>
                                                    <span aria-hidden="true">•</span>
                                                    <span>{item.createdByName}</span>
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
                                className="border-foreground/20"
                                aria-label="Página anterior"
                                render={<Link href={`${basePath}?pagina=${data.page - 1}`} />}
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
                                className="border-foreground/20"
                                aria-label="Próxima página"
                                render={<Link href={`${basePath}?pagina=${data.page + 1}`} />}
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
    );
}

function groupByDay(items: HistoryItemRecord[]): DayGroup[] {
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
