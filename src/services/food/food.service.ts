import "server-only";

import { randomBytes } from "node:crypto";
import { cacheLife, cacheTag } from "next/cache";

import { serverFailure, serverSuccess, type ServerResponse } from "@/@types/server-response";
import { createFoodSchema } from "@/app/(sistema)/cestas/schema";
import { Prisma } from "@/generated/prisma/client";
import {
    formatDateBr,
    formatDateOnlyBr,
    formatDateTimeBr,
    getBrazilDateKey,
    getBrazilTodayUtc,
    getExpiryStatus,
    getHistoryDayGroup,
    parseBrazilianDateInput,
} from "@/lib/date-br";
import prisma from "@/lib/prisma";
import {
    foodTypeLabels,
    isFoodType,
    type CreateFoodInput,
    type FoodListPage,
    type FoodListTab,
    type FoodOptionRecord,
    type FoodRecord,
    type FoodType,
    type HistoryPage,
    type InventoryActor,
} from "@/services/food/food.type";

export const FOOD_CACHE_TAG = "foods";
export const FOOD_HISTORY_CACHE_TAG = "food-history";

const MS_PER_DAY = 86_400_000;
const EXPIRING_WINDOW_DAYS = 7;
const DEFAULT_FOODS_PAGE_SIZE = 15;
const DEFAULT_HISTORY_PAGE_SIZE = 10;
const MAX_BATCH_ATTEMPTS = 5;

/**
 * Lista alimentos ordenados alfabeticamente para seleção em formulários de cesta e modelo.
 */
export async function listFoodOptions(): Promise<FoodOptionRecord[]> {
    "use cache";
    cacheTag(FOOD_CACHE_TAG);
    cacheLife("minutes");

    const referenceDateKey = getBrazilDateKey(new Date());

    const rows = await prisma.food.findMany({
        orderBy: [{ label: "asc" }, { createdAt: "desc" }],
        select: {
            id: true,
            label: true,
            type: true,
            batch: true,
            quantity: true,
            expiresAt: true,
        },
    });

    return rows.map((row) => {
        const type = resolveFoodType(row.type);

        return {
            id: row.id,
            label: row.label,
            type,
            typeLabel: foodTypeLabels[type],
            batch: row.batch,
            quantity: row.quantity,
            expiresAtLabel: row.expiresAt ? formatDateOnlyBr(row.expiresAt) : null,
            expiryStatus: getExpiryStatus(row.expiresAt, referenceDateKey),
        };
    });
}

/**
 * Lista alimentos paginados (15 por página) para as abas "Geral" e "Vencendo".
 */
export async function listFoodsPage({
    tab,
    page,
    pageSize = DEFAULT_FOODS_PAGE_SIZE,
}: {
    tab: FoodListTab;
    page: number;
    pageSize?: number;
}): Promise<FoodListPage> {
    "use cache";
    cacheTag(FOOD_CACHE_TAG);
    cacheLife("minutes");

    const referenceDateKey = getBrazilDateKey(new Date());

    const sevenDaysLimit = new Date(
        getBrazilTodayUtc(referenceDateKey) + EXPIRING_WINDOW_DAYS * MS_PER_DAY,
    );
    const expiringWhere: Prisma.FoodWhereInput = {
        expiresAt: {
            not: null,
            lte: sevenDaysLimit,
        },
    };

    const [totalAll, totalExpiring] = await Promise.all([
        prisma.food.count(),
        prisma.food.count({ where: expiringWhere }),
    ]);

    const total = tab === "vencendo" ? totalExpiring : totalAll;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(Math.max(1, page), pageCount);

    const rows = await prisma.food.findMany({
        where: tab === "vencendo" ? expiringWhere : undefined,
        orderBy:
            tab === "vencendo"
                ? [{ expiresAt: "asc" }, { label: "asc" }]
                : [{ label: "asc" }, { createdAt: "desc" }],
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
    });

    return {
        tab,
        items: rows.map((row) => toFoodRecord(row, referenceDateKey)),
        total,
        totalAll,
        totalExpiring,
        page: currentPage,
        pageCount,
    };
}

/**
 * Lista o histórico paginado de entradas e saídas de alimentos (10 por página).
 */
export async function listFoodHistoryPage({
    page,
    pageSize = DEFAULT_HISTORY_PAGE_SIZE,
}: {
    page: number;
    pageSize?: number;
}): Promise<HistoryPage> {
    "use cache";
    cacheTag(FOOD_HISTORY_CACHE_TAG);
    cacheLife("minutes");

    const referenceDateKey = getBrazilDateKey(new Date());

    const total = await prisma.foodHistory.count();
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(Math.max(1, page), pageCount);

    const rows = await prisma.foodHistory.findMany({
        orderBy: { createdAt: "desc" },
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
    });

    return {
        items: rows.map((row) => {
            const dayGroup = getHistoryDayGroup(row.createdAt, referenceDateKey);

            return {
                id: row.id,
                type: row.type === "out" ? "out" : "in",
                title: row.description,
                subtitle: `#${row.foodBatch}`,
                createdAtLabel: formatDateTimeBr(row.createdAt),
                createdByName: row.createdByName,
                dayKey: dayGroup.key,
                dayLabel: dayGroup.label,
            };
        }),
        total,
        page: currentPage,
        pageCount,
    };
}

/**
 * Cadastra um novo alimento com lote hexadecimal único de 8 caracteres e registra entrada no histórico.
 */
export async function createFood(
    actor: InventoryActor,
    input: CreateFoodInput,
): Promise<ServerResponse<{ id: string; batch: string }>> {
    const parsed = createFoodSchema.safeParse(input);

    if (!parsed.success) {
        return serverFailure(parsed.error.issues[0]?.message ?? "Dados inválidos.");
    }

    const value = parsed.data;
    const expiresAt = value.expiresAt === "" ? null : parseBrazilianDateInput(value.expiresAt);

    if (value.expiresAt !== "" && !expiresAt) {
        return serverFailure("Informe uma data válida no formato DD/MM/AAAA.");
    }

    for (let attempt = 0; attempt < MAX_BATCH_ATTEMPTS; attempt += 1) {
        const batch = generateBatchCode();

        try {
            const created = await prisma.$transaction(async (tx) => {
                const food = await tx.food.create({
                    data: {
                        label: value.label,
                        type: value.type,
                        expiresAt,
                        brand: emptyToNull(value.brand),
                        quantity: value.quantity,
                        batch,
                        productCode: emptyToNull(value.productCode),
                        createdById: actor.id,
                        createdByName: actor.name,
                    },
                    select: {
                        id: true,
                        batch: true,
                        label: true,
                        quantity: true,
                    },
                });

                await tx.foodHistory.create({
                    data: {
                        foodId: food.id,
                        foodLabel: food.label,
                        foodBatch: food.batch,
                        type: "in",
                        quantity: food.quantity,
                        description:
                            food.quantity === 1
                                ? `1 unidade de ${food.label} adicionada`
                                : `${food.quantity} unidades de ${food.label} adicionadas`,
                        createdById: actor.id,
                        createdByName: actor.name,
                    },
                });

                return food;
            });

            return serverSuccess(
                { id: created.id, batch: created.batch },
                "Alimento cadastrado com sucesso.",
            );
        } catch (error) {
            if (isBatchConflictError(error)) {
                continue;
            }

            throw error;
        }
    }

    return serverFailure("Não foi possível gerar um lote único. Tente novamente.");
}

function toFoodRecord(
    row: {
        id: string;
        label: string;
        type: string;
        expiresAt: Date | null;
        brand: string | null;
        quantity: number;
        batch: string;
        productCode: string | null;
        createdAt: Date;
    },
    referenceDateKey: string,
): FoodRecord {
    const type = resolveFoodType(row.type);

    return {
        id: row.id,
        label: row.label,
        type,
        typeLabel: foodTypeLabels[type],
        batch: row.batch,
        brand: row.brand ?? "",
        productCode: row.productCode ?? "",
        quantity: row.quantity,
        createdAtLabel: formatDateBr(row.createdAt),
        expiresAtLabel: row.expiresAt ? formatDateOnlyBr(row.expiresAt) : null,
        expiryStatus: getExpiryStatus(row.expiresAt, referenceDateKey),
    };
}

function resolveFoodType(value: string): FoodType {
    return isFoodType(value) ? value : "arroz";
}

function generateBatchCode(): string {
    return randomBytes(4).toString("hex").toUpperCase();
}

function emptyToNull(value: string): string | null {
    const trimmed = value.trim();

    return trimmed === "" ? null : trimmed;
}

function isBatchConflictError(error: unknown): boolean {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
        return false;
    }

    const target = Array.isArray(error.meta?.target)
        ? error.meta.target.join(" ")
        : String(error.meta?.target ?? "");

    return target.includes("batch");
}
