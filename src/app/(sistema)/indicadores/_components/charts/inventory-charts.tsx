"use client";

import Link from "next/link";
import {
    Alert02Icon,
    ArrowRight01Icon,
    CheckmarkCircle02Icon,
    PackageIcon,
    ShoppingBasket03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useReducedMotion } from "motion/react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
    ChartEmptyState,
    DonutChartCard,
    formatNumberBr,
    HorizontalBarCard,
    IndicatorCard,
} from "@/app/(sistema)/indicadores/_components/chart-card";
import { Badge } from "@/components/ui/badge";
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import type {
    DeliveryFlowIndicators,
    ExpiryHealthBucketKey,
    InventoryIndicators,
} from "@/services/indicator/indicator.type";

const EXPIRY_COLORS: Record<ExpiryHealthBucketKey, string> = {
    expired: "var(--destructive)",
    expiring_7d: "oklch(0.769 0.188 70.08)",
    expiring_30d: "var(--chart-1)",
    ok: "oklch(0.696 0.17 162.48)",
    none: "var(--muted-foreground)",
};

const FOOD_FLOW_CONFIG = {
    foodsIn: {
        label: "Entradas (unid.)",
        color: "var(--chart-1)",
    },
    foodsOut: {
        label: "Saídas (unid.)",
        color: "var(--chart-3)",
    },
} satisfies ChartConfig;

/**
 * Gráfico de barras horizontais do estoque atual de alimentos por categoria.
 */
export function FoodStockByTypeBarChart({
    inventory,
    index = 0,
}: {
    inventory: InventoryIndicators;
    index?: number;
}) {
    const data = inventory.foodStockByType.map((item) => ({
        label: item.label,
        value: item.quantity,
        secondaryText: `${item.lots} ${item.lots === 1 ? "lote" : "lotes"}`,
    }));

    return (
        <HorizontalBarCard
            title="Estoque por categoria de alimento"
            description="Unidades disponíveis com estoque positivo por tipo de alimento."
            seriesLabel="Unidades"
            data={data}
            color="var(--chart-2)"
            emptyIcon={PackageIcon}
            emptyDescription="Nenhum alimento com estoque disponível no momento."
            footer={
                inventory.zeroStockFoodCategoriesCount > 0
                    ? `${formatNumberBr(inventory.zeroStockFoodCategoriesCount)} ${inventory.zeroStockFoodCategoriesCount === 1 ? "categoria está sem estoque no momento." : "categorias estão sem estoque no momento."}`
                    : "Todas as categorias cadastradas possuem estoque positivo."
            }
            index={index}
        />
    );
}

/**
 * Gráfico de rosca com a distribuição de lotes ativos por status de validade.
 */
export function FoodExpiryDonutChart({
    inventory,
    index = 0,
}: {
    inventory: InventoryIndicators;
    index?: number;
}) {
    const config = Object.fromEntries(
        inventory.expiryHealth.map((item) => [
            item.key,
            {
                label: item.label,
                color: EXPIRY_COLORS[item.key],
            },
        ]),
    ) satisfies ChartConfig;

    const slices = inventory.expiryHealth.map((item) => ({
        key: item.key,
        label: item.label,
        value: item.lots,
        fill: EXPIRY_COLORS[item.key],
    }));

    return (
        <DonutChartCard
            title="Saúde de validade do estoque"
            description="Lotes ativos distribuídos por prazo de vencimento."
            centerLabel="lotes ativos"
            centerValue={inventory.totalFoodLots}
            data={slices}
            config={config}
            emptyIcon={PackageIcon}
            emptyDescription="Nenhum lote de alimento com quantidade disponível."
            index={index}
        />
    );
}

/**
 * Gráfico de barras agrupadas comparando entradas e saídas mensais de alimentos (6 meses).
 */
export function FoodFlowBarChart({
    deliveries,
    index = 0,
}: {
    deliveries: DeliveryFlowIndicators;
    index?: number;
}) {
    const prefersReducedMotion = useReducedMotion();
    const hasActivity = deliveries.monthlySeries.some(
        (point) => point.foodsIn > 0 || point.foodsOut > 0,
    );

    return (
        <IndicatorCard
            title="Fluxo mensal de alimentos"
            description="Unidades movimentadas em entradas e retiradas nos últimos 6 meses."
            index={index}
        >
            {!hasActivity ? (
                <ChartEmptyState
                    icon={PackageIcon}
                    description="Nenhuma movimentação de alimentos registrada nos últimos 6 meses."
                />
            ) : (
                <ChartContainer
                    config={FOOD_FLOW_CONFIG}
                    className="aspect-auto h-[240px] w-full sm:h-[270px]"
                >
                    <BarChart
                        data={deliveries.monthlySeries}
                        margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="monthLabel"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <YAxis width={34} tickLine={false} axisLine={false} allowDecimals={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                            dataKey="foodsIn"
                            fill="var(--color-foodsIn)"
                            radius={[6, 6, 0, 0]}
                            maxBarSize={24}
                            isAnimationActive={!prefersReducedMotion}
                            animationDuration={650}
                            animationEasing="ease-out"
                        />
                        <Bar
                            dataKey="foodsOut"
                            fill="var(--color-foodsOut)"
                            radius={[6, 6, 0, 0]}
                            maxBarSize={24}
                            isAnimationActive={!prefersReducedMotion}
                            animationDuration={650}
                            animationEasing="ease-out"
                        />
                        <ChartLegend
                            content={<ChartLegendContent className="flex-wrap gap-x-4 gap-y-1.5" />}
                        />
                    </BarChart>
                </ChartContainer>
            )}
        </IndicatorCard>
    );
}

/**
 * Gráfico de barras horizontais das cestas prontas agrupadas por modelo.
 */
export function BasketsByTemplateBarChart({
    inventory,
    index = 0,
}: {
    inventory: InventoryIndicators;
    index?: number;
}) {
    const data = inventory.basketsByTemplate.map((item) => ({
        label: item.label,
        value: item.quantity,
    }));

    return (
        <HorizontalBarCard
            title="Cestas disponíveis por modelo"
            description="Quantidade de cestas prontas agrupadas pelo modelo de origem."
            seriesLabel="Cestas"
            data={data}
            color="var(--chart-3)"
            emptyIcon={ShoppingBasket03Icon}
            emptyDescription="Nenhuma cesta pronta disponível em estoque."
            index={index}
        />
    );
}

/**
 * Lista acionável dos lotes vencidos ou próximos do vencimento (até 7 dias).
 */
export function UrgentExpiringFoodsCard({
    inventory,
    index = 0,
}: {
    inventory: InventoryIndicators;
    index?: number;
}) {
    const items = inventory.urgentExpiringFoods;

    return (
        <IndicatorCard
            title="Lotes que exigem atenção"
            description="Alimentos vencidos ou com vencimento em até 7 dias."
            className="lg:col-span-2"
            action={
                <Link
                    href="/cestas/alimentos/listar?aba=vencendo"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                    Ver lista
                    <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-3.5" />
                </Link>
            }
            index={index}
        >
            {items.length === 0 ? (
                <ChartEmptyState
                    icon={CheckmarkCircle02Icon}
                    title="Nenhum alerta crítico"
                    description="Não há alimentos vencidos ou vencendo nos próximos 7 dias."
                />
            ) : (
                <div className="divide-y rounded-xl border">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="min-w-0">
                                <p className="truncate font-medium">{item.label}</p>
                                <p className="text-xs text-muted-foreground">
                                    Lote {item.batch} • {formatNumberBr(item.quantity)}{" "}
                                    {item.quantity === 1 ? "unidade" : "unidades"}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground tabular-nums">
                                    Validade: {item.expiresAtLabel}
                                </span>
                                <Badge
                                    variant={item.expiryStatus === "expired" ? "destructive" : "warning"}
                                >
                                    <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} className="mr-1 size-3" />
                                    {item.expiryStatus === "expired" ? "Vencido" : "Vencendo"}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </IndicatorCard>
    );
}
