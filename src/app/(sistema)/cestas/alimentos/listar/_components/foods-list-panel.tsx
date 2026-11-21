"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Alert02Icon,
    ArrowLeft01Icon,
    ArrowRight01Icon,
    InboxIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FoodListPage } from "@/services/food/food.type";

/**
 * Painel de listagem de alimentos com abas "Geral" e "Vencendo" e paginação de 15 itens.
 */
export function FoodsListPanel({ data }: { data: FoodListPage }) {
    const router = useRouter();

    function handleTabChange(nextTab: string | null) {
        if (nextTab === "geral" || nextTab === "vencendo") {
            router.push(`/cestas/alimentos/listar?aba=${nextTab}`);
        }
    }

    return (
        <Tabs value={data.tab} onValueChange={handleTabChange} className="flex flex-col gap-5">
            <TabsList>
                <TabsTrigger value="geral">Geral ({data.totalAll})</TabsTrigger>
                <TabsTrigger value="vencendo">Vencendo ({data.totalExpiring})</TabsTrigger>
            </TabsList>

            <TabsContent value={data.tab} className="flex flex-col gap-6">
                {data.items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border bg-card py-16 text-center text-muted-foreground">
                        <HugeiconsIcon icon={InboxIcon} strokeWidth={2} className="size-10" />
                        <div className="flex flex-col gap-1">
                            <p className="text-base font-semibold text-foreground">
                                {data.tab === "vencendo"
                                    ? "Nenhum alimento próximo do vencimento"
                                    : "Nenhum alimento cadastrado"}
                            </p>
                            <p className="text-sm">
                                {data.tab === "vencendo"
                                    ? "Não há alimentos vencidos ou com vencimento nos próximos 7 dias."
                                    : "Cadastre alimentos no hub de Cestas e Alimentos para vê-los aqui."}
                            </p>
                        </div>
                    </div>
                ) : (
                    <ul className="flex flex-col gap-3">
                        {data.items.map((food) => (
                            <li key={food.id}>
                                <article className="flex flex-col gap-3 rounded-2xl border bg-card p-4 text-card-foreground sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-base font-semibold">{food.label}</h3>
                                            {food.brand ? (
                                                <span className="text-xs text-muted-foreground">
                                                    · {food.brand}
                                                </span>
                                            ) : null}
                                            <Badge variant={food.quantity === 0 ? "destructive" : "muted"}>
                                                {food.quantity} un.
                                            </Badge>
                                        </div>

                                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                            <span>{food.typeLabel}</span>
                                            <span aria-hidden="true">•</span>
                                            <span className="font-mono">#{food.batch}</span>
                                            <span aria-hidden="true">•</span>
                                            <span>Cadastro: {food.createdAtLabel}</span>
                                            {food.expiryStatus === "ok" || food.expiryStatus === "none" ? (
                                                <>
                                                    <span aria-hidden="true">•</span>
                                                    <span>
                                                        Validade: {food.expiresAtLabel ?? "Sem validade"}
                                                    </span>
                                                </>
                                            ) : null}
                                        </div>
                                    </div>

                                    {food.expiryStatus === "expiring" && food.expiresAtLabel ? (
                                        <Badge variant="warning" className="gap-1.5 py-1">
                                            <HugeiconsIcon
                                                icon={Alert02Icon}
                                                strokeWidth={2}
                                                className="size-3.5"
                                            />
                                            Validade: {food.expiresAtLabel}
                                        </Badge>
                                    ) : null}

                                    {food.expiryStatus === "expired" && food.expiresAtLabel ? (
                                        <Badge variant="destructive" className="gap-1.5 py-1">
                                            <HugeiconsIcon
                                                icon={Alert02Icon}
                                                strokeWidth={2}
                                                className="size-3.5"
                                            />
                                            Vencido · {food.expiresAtLabel}
                                        </Badge>
                                    ) : null}
                                </article>
                            </li>
                        ))}
                    </ul>
                )}

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
                                            href={`/cestas/alimentos/listar?aba=${data.tab}&pagina=${data.page - 1}`}
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
                                            href={`/cestas/alimentos/listar?aba=${data.tab}&pagina=${data.page + 1}`}
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
            </TabsContent>
        </Tabs>
    );
}
