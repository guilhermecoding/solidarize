"use client";

import type { ReactNode } from "react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { motion, useReducedMotion } from "motion/react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Label,
    LabelList,
    Pie,
    PieChart,
    XAxis,
    YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const integerFormatter = new Intl.NumberFormat("pt-BR");

export function formatNumberBr(value: number): string {
    return integerFormatter.format(value);
}

export function truncateLabel(value: string, maxLength: number): string {
    if (value.length <= maxLength) {
        return value;
    }

    return `${value.slice(0, Math.max(1, maxLength - 1)).trimEnd()}…`;
}

export function safePercent(part: number, total: number): number {
    if (total <= 0 || part <= 0) {
        return 0;
    }

    return Math.round((part / total) * 100);
}

type KpiBadgeVariant = "default" | "secondary" | "outline" | "success" | "warning" | "destructive" | "muted";

/**
 * Card de métrica principal (KPI) com entrada animada opcional.
 */
export function KpiCard({
    title,
    value,
    subtitle,
    icon,
    badge,
    badgeVariant = "secondary",
    index = 0,
}: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: IconSvgElement;
    badge?: string;
    badgeVariant?: KpiBadgeVariant;
    index?: number;
}) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
                prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 0.28, delay: index * 0.05, ease: "easeOut" }
            }
            className="h-full"
        >
            <Card size="sm" className="h-full justify-between gap-3 py-4">
                <CardHeader className="gap-1">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            {title}
                        </span>
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                            <HugeiconsIcon icon={icon} strokeWidth={2} className="size-4" />
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">
                            {typeof value === "number" ? formatNumberBr(value) : value}
                        </span>
                        {badge ? <Badge variant={badgeVariant}>{badge}</Badge> : null}
                    </div>
                    <p className="text-xs text-muted-foreground">{subtitle}</p>
                </CardContent>
            </Card>
        </motion.div>
    );
}

/**
 * Container padrão para cards de gráficos e listas analíticas.
 */
export function IndicatorCard({
    title,
    description,
    action,
    footer,
    children,
    className,
    index = 0,
}: {
    title: string;
    description?: string;
    action?: ReactNode;
    footer?: ReactNode;
    children: ReactNode;
    className?: string;
    index?: number;
}) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
                prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 0.32, delay: Math.min(index * 0.05, 0.25), ease: "easeOut" }
            }
            className={cn("min-w-0", className)}
        >
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    {description ? <CardDescription>{description}</CardDescription> : null}
                    {action ? <CardAction>{action}</CardAction> : null}
                </CardHeader>
                <CardContent className="flex-1">{children}</CardContent>
                {footer ? (
                    <CardFooter className="border-t pt-4 text-xs text-muted-foreground">
                        {footer}
                    </CardFooter>
                ) : null}
            </Card>
        </motion.div>
    );
}

/**
 * Estado vazio padronizado para gráficos sem dados disponíveis.
 */
export function ChartEmptyState({
    icon,
    title = "Sem dados para exibir",
    description,
}: {
    icon: IconSvgElement;
    title?: string;
    description: string;
}) {
    return (
        <div className="flex h-52 flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/20 px-4 text-center">
            <HugeiconsIcon
                icon={icon}
                strokeWidth={1.75}
                className="size-8 text-muted-foreground/70"
            />
            <p className="text-sm font-medium">{title}</p>
            <p className="max-w-xs text-xs text-muted-foreground">{description}</p>
        </div>
    );
}

export type HorizontalBarItem = {
    label: string;
    value: number;
    secondaryText?: string;
};

/**
 * Gráfico de barras horizontais reutilizável com truncamento responsivo e tooltip completo.
 */
export function HorizontalBarCard({
    title,
    description,
    seriesLabel,
    data,
    color = "var(--chart-2)",
    emptyIcon,
    emptyDescription,
    footer,
    action,
    index = 0,
}: {
    title: string;
    description: string;
    seriesLabel: string;
    data: HorizontalBarItem[];
    color?: string;
    emptyIcon: IconSvgElement;
    emptyDescription: string;
    footer?: ReactNode;
    action?: ReactNode;
    index?: number;
}) {
    const isMobile = useIsMobile();
    const prefersReducedMotion = useReducedMotion();

    const chartConfig = {
        value: {
            label: seriesLabel,
            color,
        },
    } satisfies ChartConfig;

    const chartHeight = Math.max(200, data.length * 40);
    const yAxisWidth = isMobile ? 96 : 140;
    const maxTickChars = isMobile ? 12 : 19;

    return (
        <IndicatorCard
            title={title}
            description={description}
            action={action}
            footer={footer}
            index={index}
        >
            {data.length === 0 ? (
                <ChartEmptyState icon={emptyIcon} description={emptyDescription} />
            ) : (
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto w-full"
                    style={{ height: `${chartHeight}px` }}
                >
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 4, right: 36, left: 4, bottom: 4 }}
                    >
                        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                        <XAxis type="number" hide allowDecimals={false} />
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
                            cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                            content={
                                <ChartTooltipContent
                                    formatter={(val, _name, item) => {
                                        const numericVal = typeof val === "number" ? val : Number(val ?? 0);
                                        const extra = (item.payload as HorizontalBarItem | undefined)?.secondaryText;

                                        return (
                                            <div className="flex w-full items-center justify-between gap-4">
                                                <span className="text-muted-foreground">{seriesLabel}</span>
                                                <span className="font-mono font-medium text-foreground tabular-nums">
                                                    {formatNumberBr(numericVal)}
                                                    {extra ? ` (${extra})` : ""}
                                                </span>
                                            </div>
                                        );
                                    }}
                                />
                            }
                        />
                        <Bar
                            dataKey="value"
                            fill="var(--color-value)"
                            radius={[0, 8, 8, 0]}
                            barSize={24}
                            isAnimationActive={!prefersReducedMotion}
                            animationDuration={650}
                            animationEasing="ease-out"
                        >
                            <LabelList
                                dataKey="value"
                                position="right"
                                offset={8}
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

export type DonutSliceItem = {
    key: string;
    label: string;
    value: number;
    fill: string;
};

/**
 * Gráfico de rosca (Donut) reutilizável com total central e legenda responsiva.
 */
export function DonutChartCard({
    title,
    description,
    centerLabel,
    centerValue,
    data,
    config,
    emptyIcon,
    emptyDescription,
    footer,
    index = 0,
}: {
    title: string;
    description: string;
    centerLabel: string;
    centerValue: number;
    data: DonutSliceItem[];
    config: ChartConfig;
    emptyIcon: IconSvgElement;
    emptyDescription: string;
    footer?: ReactNode;
    index?: number;
}) {
    const prefersReducedMotion = useReducedMotion();
    const visibleSlices = data.filter((item) => item.value > 0);
    const total = visibleSlices.reduce((sum, item) => sum + item.value, 0);

    return (
        <IndicatorCard
            title={title}
            description={description}
            footer={footer}
            index={index}
        >
            {total === 0 ? (
                <ChartEmptyState icon={emptyIcon} description={emptyDescription} />
            ) : (
                <ChartContainer
                    config={config}
                    className="mx-auto aspect-auto h-[250px] w-full sm:h-[270px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    hideLabel
                                    nameKey="key"
                                    formatter={(val, _name, item) => {
                                        const slice = item.payload as DonutSliceItem | undefined;
                                        const numericVal = typeof val === "number" ? val : Number(val ?? 0);

                                        return (
                                            <div className="flex w-full items-center justify-between gap-4">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="size-2.5 shrink-0 rounded-xs"
                                                        style={{ backgroundColor: slice?.fill }}
                                                    />
                                                    <span className="text-muted-foreground">
                                                        {slice?.label ?? ""}
                                                    </span>
                                                </div>
                                                <span className="font-mono font-medium text-foreground tabular-nums">
                                                    {formatNumberBr(numericVal)} ({safePercent(numericVal, total)}%)
                                                </span>
                                            </div>
                                        );
                                    }}
                                />
                            }
                        />
                        <Pie
                            data={visibleSlices}
                            dataKey="value"
                            nameKey="key"
                            innerRadius={56}
                            outerRadius={84}
                            paddingAngle={visibleSlices.length > 1 ? 2 : 0}
                            strokeWidth={2}
                            stroke="var(--card)"
                            isAnimationActive={!prefersReducedMotion}
                            animationDuration={650}
                            animationEasing="ease-out"
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (
                                        !viewBox
                                        || !("cx" in viewBox)
                                        || !("cy" in viewBox)
                                        || typeof viewBox.cx !== "number"
                                        || typeof viewBox.cy !== "number"
                                    ) {
                                        return null;
                                    }

                                    return (
                                        <text
                                            x={viewBox.cx}
                                            y={viewBox.cy}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                        >
                                            <tspan
                                                x={viewBox.cx}
                                                y={viewBox.cy - 6}
                                                className="fill-foreground text-2xl font-bold tabular-nums"
                                            >
                                                {formatNumberBr(centerValue)}
                                            </tspan>
                                            <tspan
                                                x={viewBox.cx}
                                                y={viewBox.cy + 14}
                                                className="fill-muted-foreground text-xs"
                                            >
                                                {centerLabel}
                                            </tspan>
                                        </text>
                                    );
                                }}
                            />
                        </Pie>
                        <ChartLegend
                            content={
                                <ChartLegendContent
                                    nameKey="key"
                                    className="flex-wrap gap-x-4 gap-y-1.5"
                                />
                            }
                        />
                    </PieChart>
                </ChartContainer>
            )}
        </IndicatorCard>
    );
}
