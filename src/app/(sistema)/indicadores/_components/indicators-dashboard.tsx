"use client";

import Link from "next/link";
import {
    Alert02Icon,
    ArrowRight01Icon,
    Calendar03Icon,
    CheckmarkCircle02Icon,
    DeliveryBox01Icon,
    ShoppingBasket03Icon,
    UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { formatNumberBr, KpiCard } from "@/app/(sistema)/indicadores/_components/chart-card";
import {
    AgeDistributionBarChart,
    AidTypeDonutChart,
    FamiliesByNeighborhoodBarChart,
    FamilyCharacteristicsBarChart,
    RegistrationStatusCard,
} from "@/app/(sistema)/indicadores/_components/charts/beneficiary-charts";
import {
    AssistantWorkloadBarChart,
    BasketFlowBarChart,
    DeliveryScheduleBarChart,
    MonthlyDeliveriesAreaChart,
    MonthlyProgressDonutChart,
    RecipientBreakdownDonutChart,
    TopMembersDeliveriesCard,
} from "@/app/(sistema)/indicadores/_components/charts/delivery-charts";
import {
    BasketsByTemplateBarChart,
    FoodExpiryDonutChart,
    FoodFlowBarChart,
    FoodStockByTypeBarChart,
    UrgentExpiringFoodsCard,
} from "@/app/(sistema)/indicadores/_components/charts/inventory-charts";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { IndicatorsSnapshot } from "@/services/indicator/indicator.type";

function getDeliveryTrendBadge(current: number, previous: number): {
    label: string;
    variant: "success" | "warning" | "secondary";
} {
    if (previous === 0 && current === 0) {
        return { label: "Estável", variant: "secondary" };
    }

    if (previous === 0) {
        return { label: `+${formatNumberBr(current)} no mês`, variant: "success" };
    }

    const diffPct = Math.round(((current - previous) / previous) * 100);

    if (diffPct > 0) {
        return { label: `+${diffPct}% vs. mês ant.`, variant: "success" };
    }

    if (diffPct < 0) {
        return { label: `${diffPct}% vs. mês ant.`, variant: "warning" };
    }

    return { label: "Igual ao mês ant.", variant: "secondary" };
}

/**
 * Painel interativo de indicadores administrativos com KPI cards, alertas e abas temáticas.
 */
export function IndicatorsDashboard({ indicators }: { indicators: IndicatorsSnapshot }) {
    const { beneficiaries, inventory, deliveries, currentMonthLabel } = indicators;

    const expiryAlertsCount = inventory.expiredFoodLots + inventory.expiringSoonFoodLots;
    const pendingFamiliesCount = Math.max(
        0,
        deliveries.currentMonthProgress.totalApprovedFamilies
            - deliveries.currentMonthProgress.deliveredFamilies,
    );
    const hasStockDeficit =
        pendingFamiliesCount > 0 && inventory.totalReadyBaskets < pendingFamiliesCount;

    const deliveryTrend = getDeliveryTrendBadge(
        deliveries.currentMonthBasketsDelivered,
        deliveries.previousMonthBasketsDelivered,
    );

    const overdueFamiliesCount = deliveries.currentMonthProgress.overdueFamilies;
    const unlinkedFamiliesCount = beneficiaries.approvedWithoutAssistantCount;
    const hasOperationalAlerts =
        expiryAlertsCount > 0 || overdueFamiliesCount > 0 || unlinkedFamiliesCount > 0;

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <KpiCard
                    index={0}
                    title="Famílias ativas"
                    value={beneficiaries.approvedCount}
                    icon={UserGroupIcon}
                    badge={
                        beneficiaries.rejectedCount > 0
                            ? `${formatNumberBr(beneficiaries.rejectedCount)} não aprov.`
                            : undefined
                    }
                    badgeVariant="muted"
                    subtitle={`${formatNumberBr(beneficiaries.totalAssistedPeople)} pessoas assistidas no total`}
                />
                <KpiCard
                    index={1}
                    title="Cestas entregues"
                    value={deliveries.currentMonthBasketsDelivered}
                    icon={DeliveryBox01Icon}
                    badge={deliveryTrend.label}
                    badgeVariant={deliveryTrend.variant}
                    subtitle={`${currentMonthLabel} • ${formatNumberBr(deliveries.currentMonthDeliveriesCount)} registros`}
                />
                <KpiCard
                    index={2}
                    title="Cestas em estoque"
                    value={inventory.totalReadyBaskets}
                    icon={ShoppingBasket03Icon}
                    badge={hasStockDeficit ? "Abaixo da demanda" : undefined}
                    badgeVariant="warning"
                    subtitle={
                        pendingFamiliesCount > 0
                            ? `${formatNumberBr(pendingFamiliesCount)} famílias pendentes no mês`
                            : "Todas as famílias ativas atendidas no mês"
                    }
                />
                <KpiCard
                    index={3}
                    title="Alertas de validade"
                    value={expiryAlertsCount}
                    icon={expiryAlertsCount > 0 ? Alert02Icon : CheckmarkCircle02Icon}
                    badge={
                        inventory.expiredFoodLots > 0
                            ? `${formatNumberBr(inventory.expiredFoodLots)} vencido(s)`
                            : expiryAlertsCount > 0
                                ? "Vencendo"
                                : "Em dia"
                    }
                    badgeVariant={
                        inventory.expiredFoodLots > 0
                            ? "destructive"
                            : expiryAlertsCount > 0
                                ? "warning"
                                : "success"
                    }
                    subtitle={`${formatNumberBr(inventory.totalFoodUnits)} unid. em ${formatNumberBr(inventory.totalFoodLots)} lotes ativos`}
                />
            </div>

            {hasOperationalAlerts ? (
                <div className="flex flex-wrap items-center gap-2 rounded-2xl border bg-card px-4 py-3">
                    <span className="text-xs font-medium text-muted-foreground">
                        Pontos de atenção:
                    </span>
                    {expiryAlertsCount > 0 ? (
                        <Link href="/cestas/alimentos/listar?aba=vencendo">
                            <Badge variant={inventory.expiredFoodLots > 0 ? "destructive" : "warning"}>
                                <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} className="mr-1 size-3" />
                                {formatNumberBr(expiryAlertsCount)}{" "}
                                {expiryAlertsCount === 1 ? "lote vencido/vencendo" : "lotes vencidos/vencendo"}
                                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="ml-1 size-3" />
                            </Badge>
                        </Link>
                    ) : null}
                    {overdueFamiliesCount > 0 ? (
                        <Link href="/beneficiarios">
                            <Badge variant="warning">
                                <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="mr-1 size-3" />
                                {formatNumberBr(overdueFamiliesCount)}{" "}
                                {overdueFamiliesCount === 1
                                    ? "entrega atrasada no mês"
                                    : "entregas atrasadas no mês"}
                            </Badge>
                        </Link>
                    ) : null}
                    {unlinkedFamiliesCount > 0 ? (
                        <Link href="/beneficiarios">
                            <Badge variant="secondary">
                                {formatNumberBr(unlinkedFamiliesCount)}{" "}
                                {unlinkedFamiliesCount === 1
                                    ? "família sem assistente"
                                    : "famílias sem assistente"}
                            </Badge>
                        </Link>
                    ) : null}
                </div>
            ) : null}

            <Tabs defaultValue="overview" className="gap-5">
                <TabsList className="grid h-auto! w-full grid-cols-2 gap-1 rounded-2xl p-1 sm:inline-flex sm:h-10! sm:w-fit">
                    <TabsTrigger
                        value="overview"
                        className="h-9! min-w-0 cursor-pointer rounded-xl px-2.5 text-xs sm:h-[calc(100%-1px)]! sm:flex-initial sm:px-4 sm:text-sm"
                    >
                        <span className="truncate sm:overflow-visible sm:text-clip">Visão Geral</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="beneficiaries"
                        className="h-9! min-w-0 cursor-pointer rounded-xl px-2.5 text-xs sm:h-[calc(100%-1px)]! sm:flex-initial sm:px-4 sm:text-sm"
                    >
                        <span className="truncate sm:overflow-visible sm:text-clip">Beneficiários</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="deliveries"
                        className="h-9! min-w-0 cursor-pointer rounded-xl px-2.5 text-xs sm:h-[calc(100%-1px)]! sm:flex-initial sm:px-4 sm:text-sm"
                    >
                        <span className="truncate sm:overflow-visible sm:text-clip">Entregas e Equipe</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="inventory"
                        className="h-9! min-w-0 cursor-pointer rounded-xl px-2.5 text-xs sm:h-[calc(100%-1px)]! sm:flex-initial sm:px-4 sm:text-sm"
                    >
                        <span className="truncate sm:overflow-visible sm:text-clip">Estoque</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <MonthlyDeliveriesAreaChart deliveries={deliveries} index={0} />
                        <MonthlyProgressDonutChart
                            deliveries={deliveries}
                            currentMonthLabel={currentMonthLabel}
                            index={1}
                        />
                        <FamilyCharacteristicsBarChart beneficiaries={beneficiaries} index={2} />
                        <FamiliesByNeighborhoodBarChart beneficiaries={beneficiaries} index={3} />
                    </div>
                </TabsContent>

                <TabsContent value="beneficiaries">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <FamiliesByNeighborhoodBarChart beneficiaries={beneficiaries} index={0} />
                        <FamilyCharacteristicsBarChart beneficiaries={beneficiaries} index={1} />
                        <AidTypeDonutChart beneficiaries={beneficiaries} index={2} />
                        <AgeDistributionBarChart beneficiaries={beneficiaries} index={3} />
                        <RegistrationStatusCard beneficiaries={beneficiaries} index={4} />
                    </div>
                </TabsContent>

                <TabsContent value="deliveries">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <DeliveryScheduleBarChart beneficiaries={beneficiaries} index={0} />
                        <BasketFlowBarChart deliveries={deliveries} index={1} />
                        <RecipientBreakdownDonutChart deliveries={deliveries} index={2} />
                        <AssistantWorkloadBarChart beneficiaries={beneficiaries} index={3} />
                        <TopMembersDeliveriesCard
                            deliveries={deliveries}
                            currentMonthLabel={currentMonthLabel}
                            index={4}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="inventory">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <FoodStockByTypeBarChart inventory={inventory} index={0} />
                        <FoodExpiryDonutChart inventory={inventory} index={1} />
                        <FoodFlowBarChart deliveries={deliveries} index={2} />
                        <BasketsByTemplateBarChart inventory={inventory} index={3} />
                        <UrgentExpiringFoodsCard inventory={inventory} index={4} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
