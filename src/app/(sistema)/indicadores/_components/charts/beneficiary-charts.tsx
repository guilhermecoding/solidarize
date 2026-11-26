"use client";

import {
    HeartCheckIcon,
    Location01Icon,
    PieChartIcon,
    UserGroupIcon,
    UsersIcon,
} from "@hugeicons/core-free-icons";
import { useReducedMotion } from "motion/react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";

import {
    ChartEmptyState,
    DonutChartCard,
    formatNumberBr,
    HorizontalBarCard,
    IndicatorCard,
    safePercent,
    truncateLabel,
} from "@/app/(sistema)/indicadores/_components/chart-card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { useIsMobile } from "@/hooks/use-mobile";
import type { BeneficiaryIndicators } from "@/services/indicator/indicator.type";

const AID_TYPE_COLORS: Record<string, string> = {
    food_basket: "var(--chart-1)",
    financial: "var(--chart-2)",
    medication: "var(--chart-3)",
    other: "var(--chart-4)",
};

const CHARACTERISTICS_CONFIG = {
    count: {
        label: "Famílias ativas",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig;

const AGE_GROUPS_CONFIG = {
    count: {
        label: "Pessoas",
        color: "var(--chart-3)",
    },
} satisfies ChartConfig;

/**
 * Gráfico de barras horizontais das famílias ativas por bairro (Top 8 + Outros).
 */
export function FamiliesByNeighborhoodBarChart({
    beneficiaries,
    index = 0,
}: {
    beneficiaries: BeneficiaryIndicators;
    index?: number;
}) {
    const data = beneficiaries.byNeighborhood.map((item) => ({
        label: item.label,
        value: item.count,
        secondaryText: `${item.percentage}%`,
    }));

    return (
        <HorizontalBarCard
            title="Famílias ativas por bairro"
            description="Distribuição geográfica das famílias aprovadas (top 8 bairros)."
            seriesLabel="Famílias"
            data={data}
            color="var(--chart-2)"
            emptyIcon={Location01Icon}
            emptyDescription="Nenhuma família aprovada com endereço registrado até o momento."
            index={index}
        />
    );
}

/**
 * Gráfico de barras horizontais de características não exclusivas das famílias ativas
 * (crianças, idosos, PCD/doentes, aluguel e desemprego).
 */
export function FamilyCharacteristicsBarChart({
    beneficiaries,
    index = 0,
}: {
    beneficiaries: BeneficiaryIndicators;
    index?: number;
}) {
    const isMobile = useIsMobile();
    const prefersReducedMotion = useReducedMotion();
    const { approvedCount, activeCharacteristics } = beneficiaries;

    const yAxisWidth = isMobile ? 116 : 168;
    const maxTickChars = isMobile ? 15 : 24;
    const chartHeight = Math.max(220, activeCharacteristics.length * 44);

    return (
        <IndicatorCard
            title="Famílias ativas por características"
            description="Percentual sobre famílias aprovadas (uma família pode acumular mais de uma característica)."
            footer={
                approvedCount > 0
                    ? `Base de cálculo: ${formatNumberBr(approvedCount)} ${approvedCount === 1 ? "família ativa" : "famílias ativas"} (titular + familiares).`
                    : undefined
            }
            index={index}
        >
            {approvedCount === 0 ? (
                <ChartEmptyState
                    icon={UserGroupIcon}
                    description="Cadastre e aprove beneficiários para analisar o perfil de vulnerabilidade das famílias."
                />
            ) : (
                <ChartContainer
                    config={CHARACTERISTICS_CONFIG}
                    className="aspect-auto w-full"
                    style={{ height: `${chartHeight}px` }}
                >
                    <BarChart
                        data={activeCharacteristics}
                        layout="vertical"
                        margin={{ top: 4, right: 56, left: 4, bottom: 4 }}
                    >
                        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                        <XAxis
                            type="number"
                            hide
                            domain={[0, Math.max(approvedCount, 1)]}
                            allowDecimals={false}
                        />
                        <YAxis
                            dataKey="label"
                            type="category"
                            width={yAxisWidth}
                            tickLine={false}
                            axisLine={false}
                            interval={0}
                            tickFormatter={(val) => truncateLabel(String(val), maxTickChars)}
                        />
                        <ChartTooltip
                            cursor={{ fill: "var(--muted)", opacity: 0.35 }}
                            content={
                                <ChartTooltipContent
                                    formatter={(val, _name, item) => {
                                        const row = item.payload as { count: number; percentage: number } | undefined;
                                        const count = typeof val === "number" ? val : Number(val ?? 0);

                                        return (
                                            <div className="flex w-full items-center justify-between gap-4">
                                                <span className="text-muted-foreground">Famílias</span>
                                                <span className="font-mono font-medium text-foreground tabular-nums">
                                                    {formatNumberBr(count)} ({row?.percentage ?? 0}%)
                                                </span>
                                            </div>
                                        );
                                    }}
                                />
                            }
                        />
                        <Bar
                            dataKey="count"
                            fill="var(--color-count)"
                            background={{ fill: "var(--muted)", radius: 8 }}
                            radius={8}
                            barSize={24}
                            isAnimationActive={!prefersReducedMotion}
                            animationDuration={650}
                            animationEasing="ease-out"
                        >
                            <LabelList
                                dataKey="percentage"
                                position="right"
                                offset={8}
                                className="fill-foreground text-xs font-medium tabular-nums"
                                formatter={(val) => `${String(val ?? 0)}%`}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            )}
        </IndicatorCard>
    );
}

/**
 * Gráfico de rosca (Donut) para distribuição dos tipos de auxílio entre famílias ativas.
 */
export function AidTypeDonutChart({
    beneficiaries,
    index = 0,
}: {
    beneficiaries: BeneficiaryIndicators;
    index?: number;
}) {
    const config = Object.fromEntries(
        beneficiaries.aidTypes.map((item) => [
            item.key,
            {
                label: item.label,
                color: AID_TYPE_COLORS[item.key] ?? "var(--chart-5)",
            },
        ]),
    ) satisfies ChartConfig;

    const slices = beneficiaries.aidTypes.map((item) => ({
        key: item.key,
        label: item.label,
        value: item.count,
        fill: AID_TYPE_COLORS[item.key] ?? "var(--chart-5)",
    }));

    return (
        <DonutChartCard
            title="Tipos de auxílio"
            description="Distribuição do auxílio principal entre famílias aprovadas."
            centerLabel="famílias"
            centerValue={beneficiaries.approvedCount}
            data={slices}
            config={config}
            emptyIcon={PieChartIcon}
            emptyDescription="Nenhum tipo de auxílio registrado em famílias aprovadas."
            index={index}
        />
    );
}

/**
 * Histograma vertical de faixa etária considerando titulares e familiares com data de nascimento.
 */
export function AgeDistributionBarChart({
    beneficiaries,
    index = 0,
}: {
    beneficiaries: BeneficiaryIndicators;
    index?: number;
}) {
    const prefersReducedMotion = useReducedMotion();
    const totalWithDob = beneficiaries.ageGroups.reduce((sum, item) => sum + item.count, 0);
    const missingDob = beneficiaries.membersWithoutBirthDateCount;

    return (
        <IndicatorCard
            title="Faixa etária dos assistidos"
            description="Titulares e membros familiares vinculados a cadastros aprovados."
            footer={
                missingDob > 0
                    ? `${formatNumberBr(missingDob)} ${missingDob === 1 ? "membro familiar sem data de nascimento informada." : "membros familiares sem data de nascimento informada."}`
                    : undefined
            }
            index={index}
        >
            {totalWithDob === 0 ? (
                <ChartEmptyState
                    icon={UsersIcon}
                    description="Não há pessoas com data de nascimento em cadastros aprovados."
                />
            ) : (
                <ChartContainer
                    config={AGE_GROUPS_CONFIG}
                    className="aspect-auto h-[240px] w-full sm:h-[260px]"
                >
                    <BarChart
                        data={beneficiaries.ageGroups}
                        margin={{ top: 20, right: 8, left: 0, bottom: 4 }}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="label"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <YAxis hide allowDecimals={false} />
                        <ChartTooltip
                            cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                            content={<ChartTooltipContent />}
                        />
                        <Bar
                            dataKey="count"
                            fill="var(--color-count)"
                            radius={[8, 8, 0, 0]}
                            maxBarSize={44}
                            isAnimationActive={!prefersReducedMotion}
                            animationDuration={650}
                            animationEasing="ease-out"
                        >
                            <LabelList
                                dataKey="count"
                                position="top"
                                offset={6}
                                className="fill-foreground text-xs font-medium tabular-nums"
                                formatter={(val) =>
                                    typeof val === "number" ? formatNumberBr(val) : String(val ?? "")
                                }
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            )}
        </IndicatorCard>
    );
}

/**
 * Resumo visual da situação cadastral (Aprovados vs. Não aprovados).
 */
export function RegistrationStatusCard({
    beneficiaries,
    index = 0,
}: {
    beneficiaries: BeneficiaryIndicators;
    index?: number;
}) {
    const { totalBeneficiaries, approvedCount, rejectedCount, approvedFamilyMembersCount } =
        beneficiaries;
    const approvedPct = safePercent(approvedCount, totalBeneficiaries);
    const rejectedPct = totalBeneficiaries > 0 ? 100 - approvedPct : 0;

    return (
        <IndicatorCard
            title="Situação cadastral"
            description="Proporção entre beneficiários aprovados e não aprovados."
            className="lg:col-span-2"
            index={index}
        >
            {totalBeneficiaries === 0 ? (
                <ChartEmptyState
                    icon={HeartCheckIcon}
                    description="Nenhum beneficiário cadastrado na base."
                />
            ) : (
                <div className="flex flex-col gap-4">
                    <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-muted">
                        {approvedCount > 0 ? (
                            <div
                                className="h-full bg-emerald-500 transition-all"
                                style={{ width: `${approvedPct}%` }}
                            />
                        ) : null}
                        {rejectedCount > 0 ? (
                            <div
                                className="h-full bg-destructive/80 transition-all"
                                style={{ width: `${rejectedPct}%` }}
                            />
                        ) : null}
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="rounded-xl border bg-muted/20 p-3">
                            <p className="text-xs text-muted-foreground">Aprovados</p>
                            <p className="mt-1 text-xl font-bold text-emerald-600 tabular-nums dark:text-emerald-400">
                                {formatNumberBr(approvedCount)}{" "}
                                <span className="text-xs font-normal text-muted-foreground">
                                    ({approvedPct}%)
                                </span>
                            </p>
                        </div>
                        <div className="rounded-xl border bg-muted/20 p-3">
                            <p className="text-xs text-muted-foreground">Não aprovados</p>
                            <p className="mt-1 text-xl font-bold text-destructive tabular-nums">
                                {formatNumberBr(rejectedCount)}{" "}
                                <span className="text-xs font-normal text-muted-foreground">
                                    ({rejectedPct}%)
                                </span>
                            </p>
                        </div>
                        <div className="rounded-xl border bg-muted/20 p-3">
                            <p className="text-xs text-muted-foreground">Familiares em cadastros ativos</p>
                            <p className="mt-1 text-xl font-bold tabular-nums">
                                {formatNumberBr(approvedFamilyMembersCount)}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </IndicatorCard>
    );
}
