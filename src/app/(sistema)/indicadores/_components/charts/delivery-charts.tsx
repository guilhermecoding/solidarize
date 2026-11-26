"use client";

import { useState } from "react";
import {
    AnalyticsUpIcon,
    Calendar03Icon,
    DeliveryBox01Icon,
    ShoppingBasket03Icon,
    UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { useReducedMotion } from "motion/react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    LabelList,
    XAxis,
    YAxis,
} from "recharts";

import {
    ChartEmptyState,
    DonutChartCard,
    formatNumberBr,
    HorizontalBarCard,
    IndicatorCard,
    safePercent,
} from "@/app/(sistema)/indicadores/_components/chart-card";
import { Button } from "@/components/ui/button";
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { useIsMobile } from "@/hooks/use-mobile";
import type {
    BeneficiaryIndicators,
    DeliveryFlowIndicators,
} from "@/services/indicator/indicator.type";

const DELIVERIES_AREA_CONFIG = {
    basketsOut: {
        label: "Cestas entregues",
        color: "var(--chart-2)",
    },
    foodsOut: {
        label: "Alimentos avulsos (unid.)",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig;

const BASKET_FLOW_CONFIG = {
    basketsIn: {
        label: "Cestas montadas",
        color: "var(--chart-1)",
    },
    basketsOut: {
        label: "Cestas entregues",
        color: "var(--chart-3)",
    },
} satisfies ChartConfig;

const SCHEDULE_CONFIG = {
    count: {
        label: "Famílias previstas",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig;

const PROGRESS_CONFIG = {
    delivered: {
        label: "Já receberam",
        color: "oklch(0.696 0.17 162.48)",
    },
    upcoming: {
        label: "No prazo",
        color: "var(--chart-1)",
    },
    overdue: {
        label: "Em atraso",
        color: "var(--destructive)",
    },
    unscheduled: {
        label: "Sem dia definido",
        color: "var(--muted-foreground)",
    },
} satisfies ChartConfig;

const RECIPIENT_CONFIG = {
    listed: {
        label: "Beneficiários cadastrados",
        color: "var(--chart-2)",
    },
    unlisted: {
        label: "Retiradas avulsas",
        color: "var(--chart-4)",
    },
} satisfies ChartConfig;

/**
 * Gráfico de área com a evolução mensal de entregas (cestas e alimentos avulsos) nos últimos 6 meses.
 */
export function MonthlyDeliveriesAreaChart({
    deliveries,
    index = 0,
}: {
    deliveries: DeliveryFlowIndicators;
    index?: number;
}) {
    const prefersReducedMotion = useReducedMotion();
    const hasActivity = deliveries.monthlySeries.some(
        (point) => point.basketsOut > 0 || point.foodsOut > 0,
    );

    return (
        <IndicatorCard
            title="Evolução mensal de entregas"
            description="Cestas básicas e unidades de alimentos avulsos entregues nos últimos 6 meses."
            index={index}
        >
            {!hasActivity ? (
                <ChartEmptyState
                    icon={AnalyticsUpIcon}
                    description="Nenhuma entrega de cestas ou alimentos registrada nos últimos 6 meses."
                />
            ) : (
                <ChartContainer
                    config={DELIVERIES_AREA_CONFIG}
                    className="aspect-auto h-[250px] w-full sm:h-[270px]"
                >
                    <AreaChart
                        data={deliveries.monthlySeries}
                        margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="fillBasketsOut" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-basketsOut)" stopOpacity={0.38} />
                                <stop offset="95%" stopColor="var(--color-basketsOut)" stopOpacity={0.03} />
                            </linearGradient>
                            <linearGradient id="fillFoodsOut" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-foodsOut)" stopOpacity={0.32} />
                                <stop offset="95%" stopColor="var(--color-foodsOut)" stopOpacity={0.03} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="monthLabel"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <YAxis width={32} tickLine={false} axisLine={false} allowDecimals={false} />
                        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                        <Area
                            type="monotone"
                            dataKey="foodsOut"
                            stroke="var(--color-foodsOut)"
                            strokeWidth={2}
                            fill="url(#fillFoodsOut)"
                            isAnimationActive={!prefersReducedMotion}
                            animationDuration={650}
                            animationEasing="ease-out"
                        />
                        <Area
                            type="monotone"
                            dataKey="basketsOut"
                            stroke="var(--color-basketsOut)"
                            strokeWidth={2.2}
                            fill="url(#fillBasketsOut)"
                            isAnimationActive={!prefersReducedMotion}
                            animationDuration={650}
                            animationEasing="ease-out"
                        />
                        <ChartLegend
                            content={<ChartLegendContent className="flex-wrap gap-x-4 gap-y-1.5" />}
                        />
                    </AreaChart>
                </ChartContainer>
            )}
        </IndicatorCard>
    );
}

/**
 * Gráfico de rosca com o progresso das entregas de cestas no mês atual por status.
 */
export function MonthlyProgressDonutChart({
    deliveries,
    currentMonthLabel,
    index = 0,
}: {
    deliveries: DeliveryFlowIndicators;
    currentMonthLabel: string;
    index?: number;
}) {
    const {
        deliveredFamilies,
        upcomingFamilies,
        overdueFamilies,
        unscheduledPendingFamilies,
        totalApprovedFamilies,
    } = deliveries.currentMonthProgress;

    const slices = [
        {
            key: "delivered",
            label: "Já receberam",
            value: deliveredFamilies,
            fill: "oklch(0.696 0.17 162.48)",
        },
        {
            key: "upcoming",
            label: "No prazo",
            value: upcomingFamilies,
            fill: "var(--chart-1)",
        },
        {
            key: "overdue",
            label: "Em atraso",
            value: overdueFamilies,
            fill: "var(--destructive)",
        },
        {
            key: "unscheduled",
            label: "Sem dia definido",
            value: unscheduledPendingFamilies,
            fill: "var(--muted-foreground)",
        },
    ];

    const coveragePct = safePercent(deliveredFamilies, totalApprovedFamilies);

    return (
        <DonutChartCard
            title="Progresso de entregas no mês"
            description={`Cobertura das famílias aprovadas em ${currentMonthLabel}.`}
            centerLabel={`${coveragePct}% entregue`}
            centerValue={deliveredFamilies}
            data={slices}
            config={PROGRESS_CONFIG}
            emptyIcon={DeliveryBox01Icon}
            emptyDescription="Nenhuma família aprovada para acompanhar entregas neste mês."
            footer={
                unscheduledPendingFamilies > 0
                    ? `${formatNumberBr(unscheduledPendingFamilies)} ${unscheduledPendingFamilies === 1 ? "família ativa ainda está sem dia previsto de entrega." : "famílias ativas ainda estão sem dia previsto de entrega."}`
                    : undefined
            }
            index={index}
        />
    );
}

/**
 * Gráfico de demanda por dia do mês previsto para entrega (com alternância semanal / dia 1–31).
 */
export function DeliveryScheduleBarChart({
    beneficiaries,
    index = 0,
}: {
    beneficiaries: BeneficiaryIndicators;
    index?: number;
}) {
    const isMobile = useIsMobile();
    const prefersReducedMotion = useReducedMotion();
    const [modeOverride, setModeOverride] = useState<"weekly" | "daily" | null>(null);
    const mode = modeOverride ?? (isMobile ? "weekly" : "daily");

    const { byDay, byWeek, unscheduledCount } = beneficiaries.expectedDeliveryDays;
    const totalScheduled = byWeek.reduce((sum, item) => sum + item.count, 0);
    const data: Array<{ label: string; count: number }> =
        mode === "weekly" ? byWeek : byDay;

    return (
        <IndicatorCard
            title="Previsão de entregas no mês"
            description="Distribuição de famílias aprovadas pelo dia previsto para entrega do benefício."
            className="lg:col-span-2"
            footer={
                unscheduledCount > 0
                    ? `${formatNumberBr(unscheduledCount)} ${unscheduledCount === 1 ? "família aprovada não possui dia previsto definido." : "famílias aprovadas não possuem dia previsto definido."}`
                    : undefined
            }
            index={index}
        >
            {totalScheduled === 0 ? (
                <ChartEmptyState
                    icon={Calendar03Icon}
                    description="Nenhuma família aprovada possui dia previsto para entrega cadastrado."
                />
            ) : (
                <>
                    <div className="mb-3 flex justify-start sm:justify-end">
                        <div className="flex items-center gap-1 rounded-xl bg-muted p-1">
                            <Button
                                type="button"
                                size="xs"
                                variant={mode === "weekly" ? "secondary" : "ghost"}
                                onClick={() => setModeOverride("weekly")}
                            >
                                Por semana
                            </Button>
                            <Button
                                type="button"
                                size="xs"
                                variant={mode === "daily" ? "secondary" : "ghost"}
                                onClick={() => setModeOverride("daily")}
                            >
                                Dia 1–31
                            </Button>
                        </div>
                    </div>
                    <ChartContainer
                        config={SCHEDULE_CONFIG}
                        className="aspect-auto h-[240px] w-full sm:h-[260px]"
                    >
                    <BarChart
                        data={data}
                        margin={{ top: 20, right: 8, left: 0, bottom: 4 }}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="label"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            interval={mode === "daily" && isMobile ? 2 : 0}
                        />
                        <YAxis width={28} tickLine={false} axisLine={false} allowDecimals={false} />
                        <ChartTooltip
                            cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(val) =>
                                        mode === "daily" ? `Dia ${String(val)}` : String(val)
                                    }
                                />
                            }
                        />
                        <Bar
                            dataKey="count"
                            fill="var(--color-count)"
                            radius={[6, 6, 0, 0]}
                            maxBarSize={mode === "weekly" ? 56 : 22}
                            isAnimationActive={!prefersReducedMotion}
                            animationDuration={650}
                            animationEasing="ease-out"
                        >
                            {mode === "weekly" ? (
                                <LabelList
                                    dataKey="count"
                                    position="top"
                                    offset={6}
                                    className="fill-foreground text-xs font-medium tabular-nums"
                                    formatter={(val) =>
                                        typeof val === "number" ? formatNumberBr(val) : String(val ?? "")
                                    }
                                />
                            ) : null}
                        </Bar>
                    </BarChart>
                </ChartContainer>
                </>
            )}
        </IndicatorCard>
    );
}

/**
 * Gráfico de barras agrupadas comparando cestas montadas vs. entregues nos últimos 6 meses.
 */
export function BasketFlowBarChart({
    deliveries,
    index = 0,
}: {
    deliveries: DeliveryFlowIndicators;
    index?: number;
}) {
    const prefersReducedMotion = useReducedMotion();
    const hasActivity = deliveries.monthlySeries.some(
        (point) => point.basketsIn > 0 || point.basketsOut > 0,
    );

    return (
        <IndicatorCard
            title="Fluxo mensal de cestas"
            description="Comparativo entre cestas montadas (entradas) e entregas (saídas)."
            index={index}
        >
            {!hasActivity ? (
                <ChartEmptyState
                    icon={ShoppingBasket03Icon}
                    description="Nenhuma movimentação de montagem ou entrega de cestas nos últimos 6 meses."
                />
            ) : (
                <ChartContainer
                    config={BASKET_FLOW_CONFIG}
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
                        <YAxis width={30} tickLine={false} axisLine={false} allowDecimals={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                            dataKey="basketsIn"
                            fill="var(--color-basketsIn)"
                            radius={[6, 6, 0, 0]}
                            maxBarSize={24}
                            isAnimationActive={!prefersReducedMotion}
                            animationDuration={650}
                            animationEasing="ease-out"
                        />
                        <Bar
                            dataKey="basketsOut"
                            fill="var(--color-basketsOut)"
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
 * Gráfico de rosca comparando entregas para beneficiários cadastrados vs. retiradas avulsas.
 */
export function RecipientBreakdownDonutChart({
    deliveries,
    index = 0,
}: {
    deliveries: DeliveryFlowIndicators;
    index?: number;
}) {
    const { listedCount, unlistedCount, totalCount } = deliveries.recipientBreakdown;

    const slices = [
        {
            key: "listed",
            label: "Beneficiários cadastrados",
            value: listedCount,
            fill: "var(--chart-2)",
        },
        {
            key: "unlisted",
            label: "Retiradas avulsas",
            value: unlistedCount,
            fill: "var(--chart-4)",
        },
    ];

    return (
        <DonutChartCard
            title="Destinatários das entregas"
            description="Proporção de retiradas para famílias cadastradas vs. avulsas (6 meses)."
            centerLabel="retiradas"
            centerValue={totalCount}
            data={slices}
            config={RECIPIENT_CONFIG}
            emptyIcon={DeliveryBox01Icon}
            emptyDescription="Nenhuma retirada registrada nos últimos 6 meses."
            index={index}
        />
    );
}

/**
 * Gráfico de barras horizontais da carga de famílias ativas por assistente.
 */
export function AssistantWorkloadBarChart({
    beneficiaries,
    index = 0,
}: {
    beneficiaries: BeneficiaryIndicators;
    index?: number;
}) {
    const data = beneficiaries.assistantWorkload.map((item) => ({
        label: item.name,
        value: item.familiesCount,
    }));

    return (
        <HorizontalBarCard
            title="Famílias por assistente"
            description="Distribuição de famílias aprovadas vinculadas a cada membro (top 10)."
            seriesLabel="Famílias"
            data={data}
            color="var(--chart-1)"
            emptyIcon={UserMultiple02Icon}
            emptyDescription="Nenhum assistente vinculado a famílias aprovadas até o momento."
            footer={
                beneficiaries.approvedWithoutAssistantCount > 0
                    ? `${formatNumberBr(beneficiaries.approvedWithoutAssistantCount)} ${beneficiaries.approvedWithoutAssistantCount === 1 ? "família aprovada está sem assistente vinculado." : "famílias aprovadas estão sem assistente vinculado."}`
                    : undefined
            }
            index={index}
        />
    );
}

/**
 * Ranking compacto de membros com mais entregas de cestas no mês atual.
 */
export function TopMembersDeliveriesCard({
    deliveries,
    currentMonthLabel,
    index = 0,
}: {
    deliveries: DeliveryFlowIndicators;
    currentMonthLabel: string;
    index?: number;
}) {
    const members = deliveries.topMembersCurrentMonth;
    const maxBaskets = Math.max(...members.map((m) => m.basketsQuantity), 1);

    return (
        <IndicatorCard
            title="Entregas no mês por membro"
            description={`Ranking de retiradas registradas em ${currentMonthLabel}.`}
            index={index}
        >
            {members.length === 0 ? (
                <ChartEmptyState
                    icon={UserMultiple02Icon}
                    description="Nenhuma entrega de cesta registrada por membros neste mês."
                />
            ) : (
                <div className="flex flex-col gap-3">
                    {members.map((member, itemIndex) => {
                        const widthPct = Math.max(8, Math.round((member.basketsQuantity / maxBaskets) * 100));

                        return (
                            <div key={`${member.name}-${itemIndex}`} className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between gap-2 text-sm">
                                    <span className="truncate font-medium">
                                        {itemIndex + 1}. {member.name}
                                    </span>
                                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                                        <strong className="font-semibold text-foreground">
                                            {formatNumberBr(member.basketsQuantity)}
                                        </strong>{" "}
                                        {member.basketsQuantity === 1 ? "cesta" : "cestas"} ({formatNumberBr(member.deliveriesCount)}{" "}
                                        {member.deliveriesCount === 1 ? "registro" : "registros"})
                                    </span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full bg-chart-2 transition-all"
                                        style={{ width: `${widthPct}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </IndicatorCard>
    );
}
