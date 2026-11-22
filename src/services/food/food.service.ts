import "server-only";

import { randomBytes } from "node:crypto";
import { cacheLife, cacheTag } from "next/cache";

import { serverFailure, serverSuccess, type ServerResponse } from "@/@types/server-response";
import { createFoodSchema, updateFoodSchema, withdrawFoodsSchema } from "@/app/(sistema)/cestas/schema";
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
import { verifyAdminPassword } from "@/lib/verify-admin-password";
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
    type UpdateFoodInput,
    type WithdrawFoodsInput,
} from "@/services/food/food.type";

export const FOOD_CACHE_TAG = "foods";
export const FOOD_HISTORY_CACHE_TAG = "food-history";

const MS_PER_DAY = 86_400_000;
const EXPIRING_WINDOW_DAYS = 7;
const DEFAULT_FOODS_PAGE_SIZE = 15;
const DEFAULT_HISTORY_PAGE_SIZE = 10;
const MAX_BATCH_ATTEMPTS = 5;

class FoodInventoryRuleError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "FoodInventoryRuleError";
    }
}

/**
 * Lista todos os alimentos com estoque disponível (quantidade > 0) para retirada.
 */
export async function listAvailableFoods(): Promise<FoodRecord[]> {
    "use cache";
    cacheTag(FOOD_CACHE_TAG);
    cacheLife("minutes");

    const referenceDateKey = getBrazilDateKey(new Date());

    const rows = await prisma.food.findMany({
        where: { quantity: { gt: 0 } },
        orderBy: [{ label: "asc" }, { createdAt: "desc" }],
    });

    return rows.map((row) => toFoodRecord(row, referenceDateKey));
}

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
                type: toHistoryType(row.type),
                title: row.description,
                subtitle: `#${row.foodBatch}`,
                detail: row.justification ? `Justificativa: ${row.justification}` : null,
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

/**
 * Atualiza um alimento existente mantendo o lote imutável e registrando alterações de estoque no histórico.
 */
export async function updateFood(
    actor: InventoryActor,
    input: UpdateFoodInput,
): Promise<ServerResponse> {
    const parsed = updateFoodSchema.safeParse(input);

    if (!parsed.success) {
        return serverFailure(parsed.error.issues[0]?.message ?? "Dados inválidos.");
    }

    const value = parsed.data;
    const expiresAt = value.expiresAt === "" ? null : parseBrazilianDateInput(value.expiresAt);

    if (value.expiresAt !== "" && !expiresAt) {
        return serverFailure("Informe uma data válida no formato DD/MM/AAAA.");
    }

    const result = await prisma.$transaction(async (tx) => {
        const current = await tx.food.findUnique({
            where: { id: value.id },
            select: {
                id: true,
                batch: true,
                quantity: true,
            },
        });

        if (!current) {
            return { type: "missing" as const };
        }

        await tx.food.update({
            where: { id: value.id },
            data: {
                label: value.label,
                type: value.type,
                expiresAt,
                brand: emptyToNull(value.brand),
                quantity: value.quantity,
                productCode: emptyToNull(value.productCode),
            },
        });

        const delta = value.quantity - current.quantity;

        if (delta > 0) {
            await tx.foodHistory.create({
                data: {
                    foodId: current.id,
                    foodLabel: value.label,
                    foodBatch: current.batch,
                    type: "in",
                    quantity: delta,
                    description:
                        delta === 1
                            ? `1 unidade de ${value.label} adicionada manualmente`
                            : `${delta} unidades de ${value.label} adicionadas manualmente`,
                    createdById: actor.id,
                    createdByName: actor.name,
                },
            });
        } else if (delta < 0) {
            const removed = Math.abs(delta);

            await tx.foodHistory.create({
                data: {
                    foodId: current.id,
                    foodLabel: value.label,
                    foodBatch: current.batch,
                    type: "out",
                    quantity: removed,
                    description:
                        removed === 1
                            ? `1 unidade de ${value.label} retirada manualmente`
                            : `${removed} unidades de ${value.label} retiradas manualmente`,
                    createdById: actor.id,
                    createdByName: actor.name,
                },
            });
        }

        return { type: "ok" as const };
    });

    if (result.type === "missing") {
        return serverFailure("Alimento não encontrado.");
    }

    return serverSuccess(undefined, "Alimento atualizado com sucesso.");
}

/**
 * Exclui um alimento após confirmar a senha de administrador, desvinculando-o das cestas e registrando no histórico.
 */
export async function deleteFood(
    actor: InventoryActor,
    id: string,
    password: string,
): Promise<ServerResponse> {
    const authCheck = await verifyAdminPassword(password);

    if (!authCheck.ok) {
        return authCheck;
    }

    const result = await prisma.$transaction(async (tx) => {
        const current = await tx.food.findUnique({
            where: { id },
            select: {
                id: true,
                label: true,
                batch: true,
                quantity: true,
            },
        });

        if (!current) {
            return { type: "missing" as const };
        }

        await tx.foodHistory.create({
            data: {
                foodId: null,
                foodLabel: current.label,
                foodBatch: current.batch,
                type: "delete",
                quantity: current.quantity,
                description: `Alimento ${current.label} excluído`,
                createdById: actor.id,
                createdByName: actor.name,
            },
        });

        await tx.food.delete({
            where: { id },
        });

        return { type: "ok" as const };
    });

    if (result.type === "missing") {
        return serverFailure("Alimento não encontrado.");
    }

    return serverSuccess(undefined, "Alimento excluído com sucesso.");
}

/**
 * Registra a retirada de um ou mais alimentos em estoque, direcionando-os para um beneficiário listado ou não listado.
 */
export async function withdrawFoods(
    actor: InventoryActor,
    input: WithdrawFoodsInput,
): Promise<ServerResponse> {
    const parsed = withdrawFoodsSchema.safeParse(input);

    if (!parsed.success) {
        return serverFailure(parsed.error.issues[0]?.message ?? "Dados inválidos.");
    }

    const data = parsed.data;
    const foodIds = data.items.map((item) => item.foodId);

    try {
        await prisma.$transaction(async (tx) => {
            let beneficiaryId: string | null = null;
            let beneficiaryName: string | null = null;
            let justification: string | null = null;

            if (data.recipientType === "listed") {
                const beneficiary = await tx.beneficiary.findUnique({
                    where: { id: data.beneficiaryId },
                    select: { id: true, name: true },
                });

                if (!beneficiary) {
                    throw new FoodInventoryRuleError("O beneficiário selecionado não foi encontrado.");
                }

                beneficiaryId = beneficiary.id;
                beneficiaryName = beneficiary.name;
            } else {
                justification = data.justification.trim();
            }

            const foods = await tx.food.findMany({
                where: { id: { in: foodIds } },
                select: {
                    id: true,
                    label: true,
                    batch: true,
                    quantity: true,
                },
            });

            if (foods.length !== foodIds.length) {
                throw new FoodInventoryRuleError("Um ou mais alimentos selecionados não existem mais.");
            }

            const foodMap = new Map(foods.map((food) => [food.id, food]));

            for (const item of data.items) {
                const food = foodMap.get(item.foodId);

                if (!food) {
                    throw new FoodInventoryRuleError("Um ou mais alimentos selecionados não existem mais.");
                }

                const updated = await tx.food.updateMany({
                    where: {
                        id: food.id,
                        quantity: { gte: item.quantity },
                    },
                    data: {
                        quantity: { decrement: item.quantity },
                    },
                });

                if (updated.count === 0) {
                    throw new FoodInventoryRuleError(
                        `Estoque insuficiente para "${food.label}" (#${food.batch}). Disponível: ${food.quantity}.`,
                    );
                }

                await tx.foodHistory.create({
                    data: {
                        foodId: food.id,
                        foodLabel: food.label,
                        foodBatch: food.batch,
                        type: "out",
                        quantity: item.quantity,
                        description: formatFoodWithdrawalDescription(item.quantity, food.label, beneficiaryName),
                        beneficiaryId,
                        beneficiaryName,
                        justification,
                        createdById: actor.id,
                        createdByName: actor.name,
                    },
                });
            }
        });

        const totalUnits = data.items.reduce((sum, item) => sum + item.quantity, 0);
        const message = totalUnits === 1
            ? "Retirada de 1 unidade de alimento registrada com sucesso."
            : `Retirada de ${totalUnits} unidades de alimentos registrada com sucesso.`;

        return serverSuccess(undefined, message);
    } catch (error) {
        if (error instanceof FoodInventoryRuleError) {
            return serverFailure(error.message);
        }

        throw error;
    }
}

function formatFoodWithdrawalDescription(
    quantity: number,
    label: string,
    beneficiaryName: string | null,
): string {
    const base = quantity === 1
        ? `1 unidade de ${label} retirada`
        : `${quantity} unidades de ${label} retiradas`;

    if (beneficiaryName) {
        return `${base} para ${beneficiaryName}`;
    }

    return `${base} (beneficiário não listado)`;
}

function toHistoryType(value: string): "in" | "out" | "delete" {
    if (value === "out" || value === "delete") {
        return value;
    }

    return "in";
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
