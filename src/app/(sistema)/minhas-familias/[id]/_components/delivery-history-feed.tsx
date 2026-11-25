import Link from "next/link";
import {
    ArrowLeft01Icon,
    ArrowRight01Icon,
    Clock01Icon,
    ShoppingBasketSecure03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
    BeneficiaryDeliveryItemRecord,
    BeneficiaryDeliveryPage,
} from "@/services/basket/basket.type";

type DeliveryHistoryFeedProps = {
    beneficiaryId: string;
    data: BeneficiaryDeliveryPage;
};

type MonthGroup = {
    key: string;
    label: string;
    items: BeneficiaryDeliveryItemRecord[];
};

/**
 * Lista agrupada por mês e paginada (10 em 10) das entregas de cesta realizadas para um beneficiário.
 */
export function DeliveryHistoryFeed({
    beneficiaryId,
    data,
}: DeliveryHistoryFeedProps) {
    if (data.items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border bg-card py-16 text-center text-muted-foreground">
                <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} className="size-10" />
                <div className="flex flex-col gap-1">
                    <p className="text-base font-semibold text-foreground">
                        Nenhuma entrega registrada
                    </p>
                    <p className="text-sm">
                        As entregas de cesta realizadas para este beneficiário aparecerão aqui.
                    </p>
                </div>
            </div>
        );
    }

    const groups = groupByMonth(data.items);
    const baseHref = `/minhas-familias/${beneficiaryId}`;

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
                                const basketLabel = item.templateLabel
                                    ? `${item.basketName} (${item.templateLabel})`
                                    : item.basketName;

                                return (
                                    <li key={item.id}>
                                        <article className="flex items-center gap-4 rounded-2xl border bg-card p-4 text-card-foreground">
                                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
                                                <HugeiconsIcon
                                                    icon={ShoppingBasketSecure03Icon}
                                                    strokeWidth={2}
                                                    className="size-5"
                                                />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="text-sm font-semibold sm:text-base">
                                                        Entrega de cesta realizada
                                                    </p>
                                                    {item.quantity > 1 ? (
                                                        <Badge variant="success">
                                                            {item.quantity} cestas
                                                        </Badge>
                                                    ) : null}
                                                </div>
                                                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                                                    <span>{item.createdByName}</span>
                                                    <span aria-hidden="true">•</span>
                                                    <span>{item.createdAtLabel}</span>
                                                    <span aria-hidden="true">•</span>
                                                    <span>{basketLabel}</span>
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
                                render={
                                    <Link
                                        href={`${baseHref}?aba=historico&pagina=${data.page - 1}`}
                                    />
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
                                className="border-foreground/20"
                                aria-label="Próxima página"
                                render={
                                    <Link
                                        href={`${baseHref}?aba=historico&pagina=${data.page + 1}`}
                                    />
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
    );
}

function groupByMonth(items: BeneficiaryDeliveryItemRecord[]): MonthGroup[] {
    const groups: MonthGroup[] = [];

    for (const item of items) {
        const last = groups[groups.length - 1];

        if (last && last.key === item.monthKey) {
            last.items.push(item);
            continue;
        }

        groups.push({
            key: item.monthKey,
            label: item.monthLabel,
            items: [item],
        });
    }

    return groups;
}
