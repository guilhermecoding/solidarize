import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import {
    formatDateOnlyBr,
    getBrazilDateKey,
    getBrazilDateParts,
    getBrazilTodayUtc,
    getExpiryStatus,
} from "@/lib/date-br";
import prisma from "@/lib/prisma";
import {
    BASKET_CACHE_TAG,
    BASKET_HISTORY_CACHE_TAG,
    BASKET_TEMPLATE_CACHE_TAG,
} from "@/services/basket/basket.service";
import { BENEFICIARY_CACHE_TAG } from "@/services/beneficiary/beneficiary.service";
import { aidTypeLabels, aidTypes } from "@/services/beneficiary/beneficiary.type";
import { FOOD_CACHE_TAG, FOOD_HISTORY_CACHE_TAG } from "@/services/food/food.service";
import { foodTypeLabels, foodTypes, isFoodType } from "@/services/food/food.type";
import type {
    BeneficiaryIndicators,
    DeliveryFlowIndicators,
    ExpiryHealthBucketKey,
    IndicatorsSnapshot,
    InventoryIndicators,
} from "@/services/indicator/indicator.type";
import { USER_CACHE_TAG } from "@/services/user/user.service";

const MS_PER_DAY = 86_400_000;
const EXPIRING_WINDOW_DAYS = 7;
const MONTH_SERIES_SIZE = 6;
const TOP_NEIGHBORHOODS_LIMIT = 8;
const TOP_TEMPLATES_LIMIT = 8;

const SHORT_MONTH_LABELS = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
] as const;

const FULL_MONTH_LABELS = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
] as const;

const AGE_GROUPS = [
    { key: "0-11", label: "0–11 anos" },
    { key: "12-17", label: "12–17 anos" },
    { key: "18-29", label: "18–29 anos" },
    { key: "30-59", label: "30–59 anos" },
    { key: "60+", label: "60+ anos" },
] as const;

const EXPIRY_HEALTH_ORDER: Array<{ key: ExpiryHealthBucketKey; label: string }> = [
    { key: "expired", label: "Vencidos" },
    { key: "expiring_7d", label: "Vence em até 7 dias" },
    { key: "expiring_30d", label: "Vence em 8–30 dias" },
    { key: "ok", label: "Em dia (+30 dias)" },
    { key: "none", label: "Sem validade" },
];

type SummaryQueryRow = {
    total_beneficiaries: number;
    approved_count: number;
    rejected_count: number;
    approved_family_members_count: number;
    members_without_birth_date_count: number;
    approved_without_assistant_count: number;
    with_children_count: number;
    with_elderly_count: number;
    with_pcd_count: number;
    with_rent_count: number;
    with_unemployed_count: number;
    unscheduled_count: number;
};

type KeyCountRow = {
    key: string;
    count: number;
};

type LabelCountRow = {
    label: string;
    count: number;
};

type DayCountRow = {
    day: number;
    count: number;
};

type AssistantWorkloadRow = {
    id: string;
    name: string;
    count: number;
};

type FoodStockTypeRow = {
    type: string;
    quantity: number;
    lots: number;
};

type ExpiryHealthRow = {
    bucket: ExpiryHealthBucketKey;
    lots: number;
    units: number;
};

type TemplateQuantityRow = {
    label: string;
    quantity: number;
};

type MonthlyFlowRow = {
    month_key: string;
    type: string;
    quantity: number;
};

type CurrentMonthProgressRow = {
    total_approved_families: number;
    delivered_families: number;
    overdue_families: number;
    upcoming_families: number;
    unscheduled_pending_families: number;
};

type RecipientBreakdownRow = {
    listed_count: number;
    unlisted_count: number;
};

type TopMemberRow = {
    name: string;
    deliveries_count: number;
    baskets_quantity: number;
};

function safePercent(part: number, total: number): number {
    if (total <= 0 || part <= 0) {
        return 0;
    }

    return Math.round((part / total) * 100);
}

function buildMonthWindow(referenceDate: Date) {
    const { year, month } = getBrazilDateParts(referenceDate);
    const months: Array<{ monthKey: string; monthLabel: string }> = [];

    for (let offset = MONTH_SERIES_SIZE - 1; offset >= 0; offset -= 1) {
        const d = new Date(Date.UTC(year, month - 1 - offset, 1));
        const mYear = d.getUTCFullYear();
        const mMonth = d.getUTCMonth() + 1;

        months.push({
            monthKey: `${mYear}-${String(mMonth).padStart(2, "0")}`,
            monthLabel: SHORT_MONTH_LABELS[mMonth - 1] ?? "",
        });
    }

    const oldest = new Date(Date.UTC(year, month - MONTH_SERIES_SIZE, 1));
    // Subtrai 1 dia em UTC para cobrir com folga a meia-noite de America/Sao_Paulo (-03:00).
    const startFilterUtc = new Date(oldest.getTime() - MS_PER_DAY);

    return { months, startFilterUtc };
}

/**
 * Agrega indicadores demográficos, características familiares, distribuição por bairro,
 * calendário previsto e carga de assistentes diretamente no PostgreSQL.
 */
export async function getBeneficiaryIndicators(): Promise<BeneficiaryIndicators> {
    "use cache";
    cacheTag(BENEFICIARY_CACHE_TAG, USER_CACHE_TAG);
    cacheLife("minutes");

    const [summaryRows, aidRows, neighborhoodRows, ageRows, dayRows, assistantRows] =
        await Promise.all([
            prisma.$queryRaw<SummaryQueryRow[]>`
                WITH member_stats AS (
                    SELECT
                        fm."beneficiaryId",
                        COUNT(*)::int AS member_count,
                        COUNT(*) FILTER (WHERE fm."dateOfBirth" IS NULL)::int AS missing_dob_count,
                        COALESCE(BOOL_OR(
                            fm."dateOfBirth" IS NOT NULL
                            AND EXTRACT(YEAR FROM age((now() AT TIME ZONE 'America/Sao_Paulo')::date, fm."dateOfBirth"::date))::int BETWEEN 0 AND 11
                        ), false) AS has_child_member,
                        COALESCE(BOOL_OR(
                            fm."dateOfBirth" IS NOT NULL
                            AND EXTRACT(YEAR FROM age((now() AT TIME ZONE 'America/Sao_Paulo')::date, fm."dateOfBirth"::date))::int >= 60
                        ), false) AS has_elderly_member,
                        COALESCE(BOOL_OR(fm.disability = 'yes'), false) AS has_pcd_member
                    FROM "public"."family_member" fm
                    GROUP BY fm."beneficiaryId"
                )
                SELECT
                    COUNT(*)::int AS total_beneficiaries,
                    COUNT(*) FILTER (WHERE b.status = 'approved')::int AS approved_count,
                    COUNT(*) FILTER (WHERE b.status <> 'approved')::int AS rejected_count,
                    COALESCE(SUM(CASE WHEN b.status = 'approved' THEN COALESCE(ms.member_count, 0) ELSE 0 END), 0)::int AS approved_family_members_count,
                    COALESCE(SUM(CASE WHEN b.status = 'approved' THEN COALESCE(ms.missing_dob_count, 0) ELSE 0 END), 0)::int AS members_without_birth_date_count,
                    COUNT(*) FILTER (
                        WHERE b.status = 'approved'
                            AND NOT EXISTS (
                                SELECT 1
                                FROM "public"."beneficiary_assistant" ba
                                WHERE ba."beneficiaryId" = b.id
                            )
                    )::int AS approved_without_assistant_count,
                    COUNT(*) FILTER (
                        WHERE b.status = 'approved'
                            AND (
                                EXTRACT(YEAR FROM age((now() AT TIME ZONE 'America/Sao_Paulo')::date, b."dateOfBirth"::date))::int BETWEEN 0 AND 11
                                OR COALESCE(ms.has_child_member, false)
                            )
                    )::int AS with_children_count,
                    COUNT(*) FILTER (
                        WHERE b.status = 'approved'
                            AND (
                                EXTRACT(YEAR FROM age((now() AT TIME ZONE 'America/Sao_Paulo')::date, b."dateOfBirth"::date))::int >= 60
                                OR COALESCE(ms.has_elderly_member, false)
                            )
                    )::int AS with_elderly_count,
                    COUNT(*) FILTER (
                        WHERE b.status = 'approved'
                            AND (b.disability = 'yes' OR COALESCE(ms.has_pcd_member, false))
                    )::int AS with_pcd_count,
                    COUNT(*) FILTER (WHERE b.status = 'approved' AND b.rent = 'yes')::int AS with_rent_count,
                    COUNT(*) FILTER (WHERE b.status = 'approved' AND b.employment = 'unemployed')::int AS with_unemployed_count,
                    COUNT(*) FILTER (WHERE b.status = 'approved' AND b."expectedDeliveryDay" IS NULL)::int AS unscheduled_count
                FROM "public"."beneficiary" b
                LEFT JOIN member_stats ms ON ms."beneficiaryId" = b.id
            `,
            prisma.$queryRaw<KeyCountRow[]>`
                SELECT b."aidType" AS key, COUNT(*)::int AS count
                FROM "public"."beneficiary" b
                WHERE b.status = 'approved'
                GROUP BY b."aidType"
            `,
            prisma.$queryRaw<LabelCountRow[]>`
                WITH normalized AS (
                    SELECT COALESCE(NULLIF(trim(b.neighborhood), ''), 'Não informado') AS raw_label
                    FROM "public"."beneficiary" b
                    WHERE b.status = 'approved'
                ),
                grouped AS (
                    SELECT
                        "system-auth".immutable_unaccent(lower(raw_label)) AS norm_key,
                        raw_label,
                        COUNT(*)::int AS freq
                    FROM normalized
                    GROUP BY norm_key, raw_label
                ),
                ranked AS (
                    SELECT
                        raw_label,
                        SUM(freq) OVER (PARTITION BY norm_key)::int AS total_count,
                        ROW_NUMBER() OVER (PARTITION BY norm_key ORDER BY freq DESC, raw_label ASC) AS rn
                    FROM grouped
                )
                SELECT raw_label AS label, total_count AS count
                FROM ranked
                WHERE rn = 1
                ORDER BY total_count DESC, raw_label ASC
            `,
            prisma.$queryRaw<KeyCountRow[]>`
                WITH approved_dobs AS (
                    SELECT b."dateOfBirth"::date AS dob
                    FROM "public"."beneficiary" b
                    WHERE b.status = 'approved'
                    UNION ALL
                    SELECT fm."dateOfBirth"::date AS dob
                    FROM "public"."family_member" fm
                    INNER JOIN "public"."beneficiary" b ON b.id = fm."beneficiaryId"
                    WHERE b.status = 'approved' AND fm."dateOfBirth" IS NOT NULL
                ),
                ages AS (
                    SELECT EXTRACT(YEAR FROM age((now() AT TIME ZONE 'America/Sao_Paulo')::date, dob))::int AS years
                    FROM approved_dobs
                )
                SELECT
                    CASE
                        WHEN years < 12 THEN '0-11'
                        WHEN years < 18 THEN '12-17'
                        WHEN years < 30 THEN '18-29'
                        WHEN years < 60 THEN '30-59'
                        ELSE '60+'
                    END AS key,
                    COUNT(*)::int AS count
                FROM ages
                GROUP BY 1
            `,
            prisma.$queryRaw<DayCountRow[]>`
                SELECT b."expectedDeliveryDay"::int AS day, COUNT(*)::int AS count
                FROM "public"."beneficiary" b
                WHERE b.status = 'approved'
                    AND b."expectedDeliveryDay" BETWEEN 1 AND 31
                GROUP BY b."expectedDeliveryDay"
            `,
            prisma.$queryRaw<AssistantWorkloadRow[]>`
                SELECT u.id, u.name, COUNT(b.id)::int AS count
                FROM "system-auth"."user" u
                INNER JOIN "public"."beneficiary_assistant" ba ON ba."userId" = u.id
                INNER JOIN "public"."beneficiary" b
                    ON b.id = ba."beneficiaryId"
                    AND b.status = 'approved'
                WHERE u.banned = false
                    OR (u."banExpires" IS NOT NULL AND u."banExpires" <= now())
                GROUP BY u.id, u.name
                ORDER BY count DESC, u.name ASC
                LIMIT 10
            `,
        ]);

    const summary = summaryRows[0];
    const totalBeneficiaries = Number(summary?.total_beneficiaries ?? 0);
    const approvedCount = Number(summary?.approved_count ?? 0);
    const rejectedCount = Number(summary?.rejected_count ?? 0);
    const approvedFamilyMembersCount = Number(summary?.approved_family_members_count ?? 0);
    const membersWithoutBirthDateCount = Number(summary?.members_without_birth_date_count ?? 0);
    const approvedWithoutAssistantCount = Number(summary?.approved_without_assistant_count ?? 0);
    const unscheduledCount = Number(summary?.unscheduled_count ?? 0);

    const aidCountMap = new Map(aidRows.map((row) => [row.key, Number(row.count)]));
    const mappedAidTypes = aidTypes.map((type) => {
        const count = aidCountMap.get(type) ?? 0;

        return {
            key: type,
            label: aidTypeLabels[type],
            count,
            percentage: safePercent(count, approvedCount),
        };
    });

    const withChildrenCount = Number(summary?.with_children_count ?? 0);
    const withElderlyCount = Number(summary?.with_elderly_count ?? 0);
    const withPcdCount = Number(summary?.with_pcd_count ?? 0);
    const withRentCount = Number(summary?.with_rent_count ?? 0);
    const withUnemployedCount = Number(summary?.with_unemployed_count ?? 0);

    const activeCharacteristics: BeneficiaryIndicators["activeCharacteristics"] = [
        {
            key: "children",
            label: "Com crianças (< 12 anos)",
            count: withChildrenCount,
            percentage: safePercent(withChildrenCount, approvedCount),
        },
        {
            key: "elderly",
            label: "Com idosos (60+ anos)",
            count: withElderlyCount,
            percentage: safePercent(withElderlyCount, approvedCount),
        },
        {
            key: "pcd",
            label: "Com PCD / deficiência",
            count: withPcdCount,
            percentage: safePercent(withPcdCount, approvedCount),
        },
        {
            key: "rent",
            label: "Pagam aluguel",
            count: withRentCount,
            percentage: safePercent(withRentCount, approvedCount),
        },
        {
            key: "unemployed",
            label: "Titular desempregado",
            count: withUnemployedCount,
            percentage: safePercent(withUnemployedCount, approvedCount),
        },
    ];

    const topNeighborhoods = neighborhoodRows.slice(0, TOP_NEIGHBORHOODS_LIMIT).map((row) => {
        const count = Number(row.count);

        return {
            label: row.label,
            count,
            percentage: safePercent(count, approvedCount),
        };
    });

    const remainingNeighborhoodsCount = neighborhoodRows
        .slice(TOP_NEIGHBORHOODS_LIMIT)
        .reduce((sum, row) => sum + Number(row.count), 0);

    if (remainingNeighborhoodsCount > 0) {
        topNeighborhoods.push({
            label: "Outros",
            count: remainingNeighborhoodsCount,
            percentage: safePercent(remainingNeighborhoodsCount, approvedCount),
        });
    }

    const ageCountMap = new Map(ageRows.map((row) => [row.key, Number(row.count)]));
    const ageGroups = AGE_GROUPS.map((group) => ({
        key: group.key,
        label: group.label,
        count: ageCountMap.get(group.key) ?? 0,
    }));

    const dayCountMap = new Map(dayRows.map((row) => [Number(row.day), Number(row.count)]));
    const byDay = Array.from({ length: 31 }, (_, index) => {
        const day = index + 1;

        return {
            day,
            label: String(day),
            count: dayCountMap.get(day) ?? 0,
        };
    });

    const weekRanges = [
        { key: "w1", label: "Dias 1–7", min: 1, max: 7 },
        { key: "w2", label: "Dias 8–14", min: 8, max: 14 },
        { key: "w3", label: "Dias 15–21", min: 15, max: 21 },
        { key: "w4", label: "Dias 22–31", min: 22, max: 31 },
    ];

    const byWeek = weekRanges.map((range) => ({
        key: range.key,
        label: range.label,
        count: byDay
            .filter((item) => item.day >= range.min && item.day <= range.max)
            .reduce((sum, item) => sum + item.count, 0),
    }));

    return {
        totalBeneficiaries,
        approvedCount,
        rejectedCount,
        approvedFamilyMembersCount,
        totalAssistedPeople: approvedCount + approvedFamilyMembersCount,
        approvedWithoutAssistantCount,
        membersWithoutBirthDateCount,
        aidTypes: mappedAidTypes,
        activeCharacteristics,
        byNeighborhood: topNeighborhoods,
        ageGroups,
        expectedDeliveryDays: {
            byDay,
            byWeek,
            unscheduledCount,
        },
        assistantWorkload: assistantRows.map((row) => ({
            id: row.id,
            name: row.name,
            familiesCount: Number(row.count),
        })),
    };
}

/**
 * Agrega indicadores de estoque de alimentos, saúde de validade e cestas disponíveis.
 */
export async function getInventoryIndicators(): Promise<InventoryIndicators> {
    "use cache";
    cacheTag(FOOD_CACHE_TAG, BASKET_CACHE_TAG, BASKET_TEMPLATE_CACHE_TAG);
    cacheLife("minutes");

    const referenceDateKey = getBrazilDateKey(new Date());
    const sevenDaysLimit = new Date(
        getBrazilTodayUtc(referenceDateKey) + EXPIRING_WINDOW_DAYS * MS_PER_DAY,
    );

    const [foodTypeRows, expiryRows, templateRows, urgentFoods] = await Promise.all([
        prisma.$queryRaw<FoodStockTypeRow[]>`
            SELECT
                f.type,
                COALESCE(SUM(f.quantity), 0)::int AS quantity,
                COUNT(*)::int AS lots
            FROM "public"."food" f
            WHERE f.quantity > 0
            GROUP BY f.type
        `,
        prisma.$queryRaw<ExpiryHealthRow[]>`
            WITH today_ref AS (
                SELECT (now() AT TIME ZONE 'America/Sao_Paulo')::date AS today
            )
            SELECT
                CASE
                    WHEN f."expiresAt" IS NULL THEN 'none'
                    WHEN f."expiresAt"::date < today_ref.today THEN 'expired'
                    WHEN f."expiresAt"::date <= (today_ref.today + 7) THEN 'expiring_7d'
                    WHEN f."expiresAt"::date <= (today_ref.today + 30) THEN 'expiring_30d'
                    ELSE 'ok'
                END AS bucket,
                COUNT(*)::int AS lots,
                COALESCE(SUM(f.quantity), 0)::int AS units
            FROM "public"."food" f
            CROSS JOIN today_ref
            WHERE f.quantity > 0
            GROUP BY 1
        `,
        prisma.$queryRaw<TemplateQuantityRow[]>`
            SELECT
                COALESCE(bt.name, b."deletedTemplateName", 'Sem modelo') AS label,
                COALESCE(SUM(b.quantity), 0)::int AS quantity
            FROM "public"."basket" b
            LEFT JOIN "public"."basket_template" bt ON bt.id = b."templateId"
            WHERE b.quantity > 0
            GROUP BY 1
            ORDER BY quantity DESC, label ASC
        `,
        prisma.food.findMany({
            where: {
                quantity: { gt: 0 },
                expiresAt: {
                    not: null,
                    lte: sevenDaysLimit,
                },
            },
            orderBy: [{ expiresAt: "asc" }, { label: "asc" }],
            take: 5,
            select: {
                id: true,
                label: true,
                batch: true,
                quantity: true,
                expiresAt: true,
            },
        }),
    ]);

    const foodStockByType = foodTypeRows
        .map((row) => {
            const label = isFoodType(row.type) ? foodTypeLabels[row.type] : row.type;

            return {
                key: row.type,
                label,
                quantity: Number(row.quantity),
                lots: Number(row.lots),
            };
        })
        .sort((a, b) => b.quantity - a.quantity || a.label.localeCompare(b.label, "pt-BR"));

    const presentFoodTypeKeys = new Set(foodStockByType.map((item) => item.key));
    const zeroStockFoodCategoriesCount = foodTypes.filter(
        (type) => !presentFoodTypeKeys.has(type),
    ).length;

    const expiryMap = new Map(
        expiryRows.map((row) => [
            row.bucket,
            { lots: Number(row.lots), units: Number(row.units) },
        ]),
    );

    const expiryHealth = EXPIRY_HEALTH_ORDER.map((item) => {
        const stats = expiryMap.get(item.key);

        return {
            key: item.key,
            label: item.label,
            lots: stats?.lots ?? 0,
            units: stats?.units ?? 0,
        };
    });

    const totalFoodUnits = expiryHealth.reduce((sum, item) => sum + item.units, 0);
    const totalFoodLots = expiryHealth.reduce((sum, item) => sum + item.lots, 0);
    const expiredFoodLots = expiryMap.get("expired")?.lots ?? 0;
    const expiringSoonFoodLots = expiryMap.get("expiring_7d")?.lots ?? 0;
    const expiringMonthFoodLots = expiryMap.get("expiring_30d")?.lots ?? 0;

    const totalReadyBaskets = templateRows.reduce(
        (sum, row) => sum + Number(row.quantity),
        0,
    );

    const basketsByTemplate = templateRows
        .slice(0, TOP_TEMPLATES_LIMIT)
        .map((row) => ({
            label: row.label,
            quantity: Number(row.quantity),
        }));

    const remainingBasketsQuantity = templateRows
        .slice(TOP_TEMPLATES_LIMIT)
        .reduce((sum, row) => sum + Number(row.quantity), 0);

    if (remainingBasketsQuantity > 0) {
        basketsByTemplate.push({
            label: "Outros",
            quantity: remainingBasketsQuantity,
        });
    }

    const urgentExpiringFoods = urgentFoods.flatMap((food) => {
        if (!food.expiresAt) {
            return [];
        }

        const status = getExpiryStatus(food.expiresAt, referenceDateKey);

        if (status !== "expired" && status !== "expiring") {
            return [];
        }

        return [{
            id: food.id,
            label: food.label,
            batch: food.batch,
            quantity: food.quantity,
            expiresAtLabel: formatDateOnlyBr(food.expiresAt),
            expiryStatus: status,
        }];
    });

    return {
        totalReadyBaskets,
        totalFoodUnits,
        totalFoodLots,
        expiredFoodLots,
        expiringSoonFoodLots,
        expiringMonthFoodLots,
        zeroStockFoodCategoriesCount,
        foodStockByType,
        expiryHealth,
        basketsByTemplate,
        urgentExpiringFoods,
    };
}

/**
 * Agrega fluxo mensal de cestas e alimentos, progresso de entregas do mês atual,
 * destinatários (cadastrados vs. avulsos) e produtividade da equipe no mês.
 */
export async function getDeliveryFlowIndicators(): Promise<DeliveryFlowIndicators> {
    "use cache";
    cacheTag(BASKET_HISTORY_CACHE_TAG, FOOD_HISTORY_CACHE_TAG, BENEFICIARY_CACHE_TAG);
    cacheLife("minutes");

    const now = new Date();
    const { year, month, day: currentDayOfMonth } = getBrazilDateParts(now);
    const currentMonthLabel = `${FULL_MONTH_LABELS[month - 1] ?? ""} de ${year}`;
    const { months, startFilterUtc } = buildMonthWindow(now);
    const currentMonthKey = months[months.length - 1]?.monthKey ?? "";
    const previousMonthKey = months[months.length - 2]?.monthKey ?? "";

    const [basketFlowRows, foodFlowRows, progressRows, recipientRows, topMemberRows, monthDeliveryRows] =
        await Promise.all([
            prisma.$queryRaw<MonthlyFlowRow[]>`
                SELECT
                    to_char((bh."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo'), 'YYYY-MM') AS month_key,
                    bh.type,
                    COALESCE(SUM(bh.quantity), 0)::int AS quantity
                FROM "public"."basket_history" bh
                WHERE bh."createdAt" >= ${startFilterUtc}
                    AND bh.type IN ('in', 'out')
                GROUP BY 1, 2
            `,
            prisma.$queryRaw<MonthlyFlowRow[]>`
                SELECT
                    to_char((fh."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo'), 'YYYY-MM') AS month_key,
                    fh.type,
                    COALESCE(SUM(fh.quantity), 0)::int AS quantity
                FROM "public"."food_history" fh
                WHERE fh."createdAt" >= ${startFilterUtc}
                    AND fh.type IN ('in', 'out')
                GROUP BY 1, 2
            `,
            prisma.$queryRaw<CurrentMonthProgressRow[]>`
                WITH delivered_this_month AS (
                    SELECT DISTINCT bh."beneficiaryId"
                    FROM "public"."basket_history" bh
                    WHERE bh.type = 'out'
                        AND bh."beneficiaryId" IS NOT NULL
                        AND to_char((bh."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo'), 'YYYY-MM') = ${currentMonthKey}
                )
                SELECT
                    COUNT(*)::int AS total_approved_families,
                    COUNT(*) FILTER (WHERE d."beneficiaryId" IS NOT NULL)::int AS delivered_families,
                    COUNT(*) FILTER (
                        WHERE d."beneficiaryId" IS NULL
                            AND b."expectedDeliveryDay" IS NOT NULL
                            AND b."expectedDeliveryDay" < ${currentDayOfMonth}
                    )::int AS overdue_families,
                    COUNT(*) FILTER (
                        WHERE d."beneficiaryId" IS NULL
                            AND b."expectedDeliveryDay" IS NOT NULL
                            AND b."expectedDeliveryDay" >= ${currentDayOfMonth}
                    )::int AS upcoming_families,
                    COUNT(*) FILTER (
                        WHERE d."beneficiaryId" IS NULL
                            AND b."expectedDeliveryDay" IS NULL
                    )::int AS unscheduled_pending_families
                FROM "public"."beneficiary" b
                LEFT JOIN delivered_this_month d ON d."beneficiaryId" = b.id
                WHERE b.status = 'approved'
            `,
            prisma.$queryRaw<RecipientBreakdownRow[]>`
                WITH outs AS (
                    SELECT bh."beneficiaryId", bh."createdAt"
                    FROM "public"."basket_history" bh
                    WHERE bh.type = 'out' AND bh."createdAt" >= ${startFilterUtc}
                    UNION ALL
                    SELECT fh."beneficiaryId", fh."createdAt"
                    FROM "public"."food_history" fh
                    WHERE fh.type = 'out' AND fh."createdAt" >= ${startFilterUtc}
                )
                SELECT
                    COUNT(*) FILTER (WHERE "beneficiaryId" IS NOT NULL)::int AS listed_count,
                    COUNT(*) FILTER (WHERE "beneficiaryId" IS NULL)::int AS unlisted_count
                FROM outs
            `,
            prisma.$queryRaw<TopMemberRow[]>`
                SELECT
                    bh."createdByName" AS name,
                    COUNT(*)::int AS deliveries_count,
                    COALESCE(SUM(bh.quantity), 0)::int AS baskets_quantity
                FROM "public"."basket_history" bh
                WHERE bh.type = 'out'
                    AND to_char((bh."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo'), 'YYYY-MM') = ${currentMonthKey}
                GROUP BY COALESCE(bh."createdById", bh."createdByName"), bh."createdByName"
                ORDER BY baskets_quantity DESC, deliveries_count DESC, bh."createdByName" ASC
                LIMIT 6
            `,
            prisma.$queryRaw<Array<{ deliveries_count: number }>>`
                SELECT COUNT(*)::int AS deliveries_count
                FROM "public"."basket_history" bh
                WHERE bh.type = 'out'
                    AND to_char((bh."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo'), 'YYYY-MM') = ${currentMonthKey}
            `,
        ]);

    const basketMap = new Map<string, { in: number; out: number }>();

    for (const row of basketFlowRows) {
        const entry = basketMap.get(row.month_key) ?? { in: 0, out: 0 };

        if (row.type === "in") {
            entry.in = Number(row.quantity);
        } else if (row.type === "out") {
            entry.out = Number(row.quantity);
        }

        basketMap.set(row.month_key, entry);
    }

    const foodMap = new Map<string, { in: number; out: number }>();

    for (const row of foodFlowRows) {
        const entry = foodMap.get(row.month_key) ?? { in: 0, out: 0 };

        if (row.type === "in") {
            entry.in = Number(row.quantity);
        } else if (row.type === "out") {
            entry.out = Number(row.quantity);
        }

        foodMap.set(row.month_key, entry);
    }

    const monthlySeries = months.map((month) => {
        const baskets = basketMap.get(month.monthKey) ?? { in: 0, out: 0 };
        const foods = foodMap.get(month.monthKey) ?? { in: 0, out: 0 };

        return {
            monthKey: month.monthKey,
            monthLabel: month.monthLabel,
            basketsOut: baskets.out,
            basketsIn: baskets.in,
            foodsOut: foods.out,
            foodsIn: foods.in,
        };
    });

    const currentMonthSeries = monthlySeries.find((m) => m.monthKey === currentMonthKey);
    const previousMonthSeries = monthlySeries.find((m) => m.monthKey === previousMonthKey);

    const progress = progressRows[0];
    const recipients = recipientRows[0];
    const listedCount = Number(recipients?.listed_count ?? 0);
    const unlistedCount = Number(recipients?.unlisted_count ?? 0);

    return {
        currentMonthLabel,
        currentDayOfMonth,
        currentMonthBasketsDelivered: currentMonthSeries?.basketsOut ?? 0,
        previousMonthBasketsDelivered: previousMonthSeries?.basketsOut ?? 0,
        currentMonthFoodUnitsDelivered: currentMonthSeries?.foodsOut ?? 0,
        currentMonthDeliveriesCount: Number(monthDeliveryRows[0]?.deliveries_count ?? 0),
        monthlySeries,
        currentMonthProgress: {
            deliveredFamilies: Number(progress?.delivered_families ?? 0),
            overdueFamilies: Number(progress?.overdue_families ?? 0),
            upcomingFamilies: Number(progress?.upcoming_families ?? 0),
            unscheduledPendingFamilies: Number(progress?.unscheduled_pending_families ?? 0),
            totalApprovedFamilies: Number(progress?.total_approved_families ?? 0),
        },
        recipientBreakdown: {
            listedCount,
            unlistedCount,
            totalCount: listedCount + unlistedCount,
        },
        topMembersCurrentMonth: topMemberRows.map((row) => ({
            name: row.name,
            deliveriesCount: Number(row.deliveries_count),
            basketsQuantity: Number(row.baskets_quantity),
        })),
    };
}

/**
 * Carrega em paralelo os 3 blocos cacheados do painel administrativo de Indicadores.
 */
export async function getDashboardIndicators(): Promise<IndicatorsSnapshot> {
    const [beneficiaries, inventory, deliveries] = await Promise.all([
        getBeneficiaryIndicators(),
        getInventoryIndicators(),
        getDeliveryFlowIndicators(),
    ]);

    return {
        currentMonthLabel: deliveries.currentMonthLabel,
        currentDayOfMonth: deliveries.currentDayOfMonth,
        beneficiaries,
        inventory,
        deliveries,
    };
}
