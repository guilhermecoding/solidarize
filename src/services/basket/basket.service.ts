import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { serverFailure, serverSuccess, type ServerResponse } from "@/@types/server-response";
import {
    basketTemplateSchema,
    createBasketSchema,
    updateBasketSchema,
    updateBasketTemplateSchema,
} from "@/app/(sistema)/cestas/schema";
import { Prisma } from "@/generated/prisma/client";
import {
    formatDateBr,
    formatDateTimeBr,
    getBrazilDateKey,
    getHistoryDayGroup,
} from "@/lib/date-br";
import prisma from "@/lib/prisma";
import type {
    BasketRecord,
    BasketTemplateRecord,
    CreateBasketInput,
    CreateBasketTemplateInput,
    UpdateBasketInput,
    UpdateBasketTemplateInput,
} from "@/services/basket/basket.type";
import {
    foodTypeLabels,
    isFoodType,
    type HistoryPage,
    type InventoryActor,
} from "@/services/food/food.type";

export const BASKET_CACHE_TAG = "baskets";
export const BASKET_TEMPLATE_CACHE_TAG = "basket-templates";
export const BASKET_HISTORY_CACHE_TAG = "basket-history";

const DEFAULT_HISTORY_PAGE_SIZE = 10;

class InventoryRuleError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InventoryRuleError";
    }
}

/**
 * Lista todos os modelos de cesta cadastrados em ordem alfabética.
 */
export async function listBasketTemplates(): Promise<BasketTemplateRecord[]> {
    "use cache";
    cacheTag(BASKET_TEMPLATE_CACHE_TAG);
    cacheLife("minutes");

    const rows = await prisma.basketTemplate.findMany({
        orderBy: { name: "asc" },
        include: {
            foods: {
                include: {
                    food: {
                        select: {
                            id: true,
                            label: true,
                            type: true,
                            batch: true,
                        },
                    },
                },
                orderBy: {
                    food: {
                        label: "asc",
                    },
                },
            },
        },
    });

    return rows.map((row) => ({
        id: row.id,
        name: row.name,
        foodIds: row.foods.map((item) => item.foodId),
        foods: row.foods.map((item) => {
            const type = isFoodType(item.food.type) ? item.food.type : "arroz";

            return {
                id: item.food.id,
                label: item.food.label,
                typeLabel: foodTypeLabels[type],
                batch: item.food.batch,
            };
        }),
        foodCount: row.foods.length,
        createdByName: row.createdByName,
        createdAtLabel: formatDateTimeBr(row.createdAt),
        createdAtDateLabel: formatDateBr(row.createdAt),
    }));
}

/**
 * Cadastra um novo modelo de cesta com alimentos obrigatórios vinculados.
 */
export async function createBasketTemplate(
    actor: InventoryActor,
    input: CreateBasketTemplateInput,
): Promise<ServerResponse<{ id: string }>> {
    const parsed = basketTemplateSchema.safeParse(input);

    if (!parsed.success) {
        return serverFailure(parsed.error.issues[0]?.message ?? "Dados inválidos.");
    }

    const name = parsed.data.name.trim();
    const foodIds = deduplicateIds(parsed.data.foodIds);

    try {
        const result = await prisma.$transaction(async (tx) => {
            const existing = await tx.basketTemplate.findFirst({
                where: { name: { equals: name, mode: "insensitive" } },
                select: { id: true },
            });

            if (existing) {
                return { type: "duplicate" as const };
            }

            const foodsExist = await verifyFoodsExist(tx, foodIds);

            if (!foodsExist) {
                return { type: "invalid-foods" as const };
            }

            const template = await tx.basketTemplate.create({
                data: {
                    name,
                    createdById: actor.id,
                    createdByName: actor.name,
                    foods: {
                        create: foodIds.map((foodId) => ({ foodId })),
                    },
                },
                select: { id: true },
            });

            return { type: "ok" as const, id: template.id };
        });

        if (result.type === "duplicate") {
            return serverFailure("Já existe um modelo com este nome.");
        }

        if (result.type === "invalid-foods") {
            return serverFailure("Um ou mais alimentos selecionados não existem.");
        }

        return serverSuccess({ id: result.id }, "Modelo de cesta cadastrado com sucesso.");
    } catch (error) {
        if (isUniqueError(error)) {
            return serverFailure("Já existe um modelo com este nome.");
        }

        throw error;
    }
}

/**
 * Atualiza um modelo de cesta existente (nome e lista de alimentos).
 */
export async function updateBasketTemplate(
    input: UpdateBasketTemplateInput,
): Promise<ServerResponse> {
    const parsed = updateBasketTemplateSchema.safeParse(input);

    if (!parsed.success) {
        return serverFailure(parsed.error.issues[0]?.message ?? "Dados inválidos.");
    }

    const { id } = parsed.data;
    const name = parsed.data.name.trim();
    const foodIds = deduplicateIds(parsed.data.foodIds);

    try {
        const result = await prisma.$transaction(async (tx) => {
            const current = await tx.basketTemplate.findUnique({
                where: { id },
                select: { id: true },
            });

            if (!current) {
                return { type: "missing" as const };
            }

            const duplicate = await tx.basketTemplate.findFirst({
                where: {
                    id: { not: id },
                    name: { equals: name, mode: "insensitive" },
                },
                select: { id: true },
            });

            if (duplicate) {
                return { type: "duplicate" as const };
            }

            const foodsExist = await verifyFoodsExist(tx, foodIds);

            if (!foodsExist) {
                return { type: "invalid-foods" as const };
            }

            await tx.basketTemplate.update({
                where: { id },
                data: { name },
            });

            await tx.basketTemplateFood.deleteMany({
                where: { templateId: id },
            });

            await tx.basketTemplateFood.createMany({
                data: foodIds.map((foodId) => ({
                    templateId: id,
                    foodId,
                })),
            });

            return { type: "ok" as const };
        });

        if (result.type === "missing") {
            return serverFailure("Modelo de cesta não encontrado.");
        }

        if (result.type === "duplicate") {
            return serverFailure("Já existe um modelo com este nome.");
        }

        if (result.type === "invalid-foods") {
            return serverFailure("Um ou mais alimentos selecionados não existem.");
        }

        return serverSuccess(undefined, "Modelo de cesta atualizado com sucesso.");
    } catch (error) {
        if (isUniqueError(error)) {
            return serverFailure("Já existe um modelo com este nome.");
        }

        throw error;
    }
}

/**
 * Exclui um modelo de cesta cadastrado.
 */
export async function deleteBasketTemplate(id: string): Promise<ServerResponse> {
    const current = await prisma.basketTemplate.findUnique({
        where: { id },
        select: { id: true },
    });

    if (!current) {
        return serverFailure("Modelo de cesta não encontrado.");
    }

    await prisma.basketTemplate.delete({
        where: { id },
    });

    return serverSuccess(undefined, "Modelo de cesta excluído com sucesso.");
}

/**
 * Retorna a prévia em cache do próximo nome sequencial diário de cesta (DD-MM-AAAA-NN).
 */
export async function getNextBasketName(): Promise<string> {
    "use cache";
    cacheTag(BASKET_CACHE_TAG);
    cacheLife("minutes");

    return readNextBasketName();
}

/**
 * Consulta sem cache o próximo nome sequencial diário de cesta (DD-MM-AAAA-NN).
 */
export async function getFreshNextBasketName(): Promise<string> {
    return readNextBasketName();
}

async function readNextBasketName(): Promise<string> {
    const dateKey = getBrazilDateKey(new Date());
    const sequence = await prisma.basketSequence.findUnique({
        where: { dateKey },
        select: { lastNumber: true },
    });

    const nextNumber = (sequence?.lastNumber ?? 0) + 1;
    return `${dateKey}-${String(nextNumber).padStart(2, "0")}`;
}

/**
 * Lista todas as cestas cadastradas da mais recente para a mais antiga.
 */
export async function listBaskets(): Promise<BasketRecord[]> {
    "use cache";
    cacheTag(BASKET_CACHE_TAG);
    cacheLife("minutes");

    const rows = await prisma.basket.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            template: {
                select: { name: true },
            },
            foods: {
                select: { foodId: true },
            },
        },
    });

    return rows.map((row) => ({
        id: row.id,
        name: row.name,
        quantity: row.quantity,
        templateId: row.templateId,
        templateName: row.template?.name ?? null,
        foodIds: row.foods.map((item) => item.foodId),
        foodCount: row.foods.length,
        createdByName: row.createdByName,
        createdAtLabel: formatDateTimeBr(row.createdAt),
        createdAtDateLabel: formatDateBr(row.createdAt),
    }));
}

/**
 * Cadastra uma nova cesta com nome sequencial diário DD-MM-AAAA-NN, dá baixa nos alimentos vinculados e registra os históricos.
 */
export async function createBasket(
    actor: InventoryActor,
    input: CreateBasketInput,
): Promise<ServerResponse<{ id: string; name: string }>> {
    const parsed = createBasketSchema.safeParse(input);

    if (!parsed.success) {
        return serverFailure(parsed.error.issues[0]?.message ?? "Dados inválidos.");
    }

    const quantity = parsed.data.quantity;
    const templateId = parsed.data.templateId === "new" ? null : parsed.data.templateId;
    const foodIds = deduplicateIds(parsed.data.foodIds);

    try {
        const created = await prisma.$transaction(async (tx) => {
            if (templateId) {
                const template = await tx.basketTemplate.findUnique({
                    where: { id: templateId },
                    select: { id: true },
                });

                if (!template) {
                    throw new InventoryRuleError("O modelo de cesta selecionado não existe.");
                }
            }

            const dateKey = getBrazilDateKey(new Date());
            const [sequence] = await tx.$queryRaw<Array<{ lastNumber: number }>>`
                INSERT INTO "public"."basket_sequence" ("dateKey", "lastNumber")
                VALUES (${dateKey}, 1)
                ON CONFLICT ("dateKey")
                DO UPDATE SET "lastNumber" = "public"."basket_sequence"."lastNumber" + 1
                RETURNING "lastNumber"
            `;

            const seqNumber = sequence?.lastNumber ?? 1;
            const basketName = `${dateKey}-${String(seqNumber).padStart(2, "0")}`;

            if (foodIds.length > 0) {
                await deductFoodsStock(tx, {
                    foodIds,
                    amountPerFood: new Map(foodIds.map((id) => [id, quantity])),
                    basketName,
                    actor,
                });
            }

            const basket = await tx.basket.create({
                data: {
                    name: basketName,
                    quantity,
                    templateId,
                    createdById: actor.id,
                    createdByName: actor.name,
                    ...(foodIds.length > 0
                        ? {
                            foods: {
                                create: foodIds.map((foodId) => ({ foodId })),
                            },
                        }
                        : {}),
                },
                select: { id: true, name: true },
            });

            await tx.basketHistory.create({
                data: {
                    basketId: basket.id,
                    basketName: basket.name,
                    type: "in",
                    quantity,
                    description: formatBasketInDescription(quantity),
                    createdById: actor.id,
                    createdByName: actor.name,
                },
            });

            return basket;
        });

        return serverSuccess(created, "Cesta cadastrada com sucesso.");
    } catch (error) {
        if (error instanceof InventoryRuleError) {
            return serverFailure(error.message);
        }

        throw error;
    }
}

/**
 * Atualiza uma cesta existente mantendo o nome imutável, sincronizando alimentos e registrando entradas/saídas.
 */
export async function updateBasket(
    actor: InventoryActor,
    input: UpdateBasketInput,
): Promise<ServerResponse> {
    const parsed = updateBasketSchema.safeParse(input);

    if (!parsed.success) {
        return serverFailure(parsed.error.issues[0]?.message ?? "Dados inválidos.");
    }

    const { id, quantity } = parsed.data;
    const templateId = parsed.data.templateId === "new" ? null : parsed.data.templateId;
    const nextFoodIds = deduplicateIds(parsed.data.foodIds);

    try {
        await prisma.$transaction(async (tx) => {
            const current = await tx.basket.findUnique({
                where: { id },
                include: {
                    foods: {
                        select: { foodId: true },
                    },
                },
            });

            if (!current) {
                throw new InventoryRuleError("Cesta não encontrada.");
            }

            if (templateId) {
                const template = await tx.basketTemplate.findUnique({
                    where: { id: templateId },
                    select: { id: true },
                });

                if (!template) {
                    throw new InventoryRuleError("O modelo de cesta selecionado não existe.");
                }
            }

            const delta = quantity - current.quantity;
            const currentFoodIds = new Set(current.foods.map((item) => item.foodId));
            const amountPerFood = new Map<string, number>();

            for (const foodId of nextFoodIds) {
                const isNewFood = !currentFoodIds.has(foodId);

                if (isNewFood && quantity > 0) {
                    amountPerFood.set(foodId, quantity);
                    continue;
                }

                if (!isNewFood && delta > 0) {
                    amountPerFood.set(foodId, delta);
                }
            }

            if (nextFoodIds.length > 0) {
                await deductFoodsStock(tx, {
                    foodIds: nextFoodIds,
                    amountPerFood,
                    basketName: current.name,
                    actor,
                });
            }

            await tx.basket.update({
                where: { id },
                data: {
                    quantity,
                    templateId,
                },
            });

            await tx.basketFood.deleteMany({
                where: { basketId: id },
            });

            if (nextFoodIds.length > 0) {
                await tx.basketFood.createMany({
                    data: nextFoodIds.map((foodId) => ({
                        basketId: id,
                        foodId,
                    })),
                });
            }

            if (delta > 0) {
                await tx.basketHistory.create({
                    data: {
                        basketId: current.id,
                        basketName: current.name,
                        type: "in",
                        quantity: delta,
                        description: formatBasketInDescription(delta),
                        createdById: actor.id,
                        createdByName: actor.name,
                    },
                });
            } else if (delta < 0) {
                const removed = Math.abs(delta);

                await tx.basketHistory.create({
                    data: {
                        basketId: current.id,
                        basketName: current.name,
                        type: "out",
                        quantity: removed,
                        description: formatBasketOutDescription(removed),
                        createdById: actor.id,
                        createdByName: actor.name,
                    },
                });
            }
        });

        return serverSuccess(undefined, "Cesta atualizada com sucesso.");
    } catch (error) {
        if (error instanceof InventoryRuleError) {
            return serverFailure(error.message);
        }

        throw error;
    }
}

/**
 * Lista o histórico paginado de entradas e saídas de cestas (10 por página).
 */
export async function listBasketHistoryPage({
    page,
    pageSize = DEFAULT_HISTORY_PAGE_SIZE,
}: {
    page: number;
    pageSize?: number;
}): Promise<HistoryPage> {
    "use cache";
    cacheTag(BASKET_HISTORY_CACHE_TAG);
    cacheLife("minutes");

    const referenceDateKey = getBrazilDateKey(new Date());

    const total = await prisma.basketHistory.count();
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(Math.max(1, page), pageCount);

    const rows = await prisma.basketHistory.findMany({
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
                subtitle: row.basketName,
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

async function deductFoodsStock(
    tx: Prisma.TransactionClient,
    {
        foodIds,
        amountPerFood,
        basketName,
        actor,
    }: {
        foodIds: string[];
        amountPerFood: Map<string, number>;
        basketName: string;
        actor: InventoryActor;
    },
) {
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
        throw new InventoryRuleError("Um ou mais alimentos selecionados não existem.");
    }

    const foodMap = new Map(foods.map((food) => [food.id, food]));

    for (const foodId of foodIds) {
        const deductAmount = amountPerFood.get(foodId) ?? 0;

        if (deductAmount <= 0) {
            continue;
        }

        const food = foodMap.get(foodId);

        if (!food) {
            throw new InventoryRuleError("Um ou mais alimentos selecionados não existem.");
        }

        const updated = await tx.food.updateMany({
            where: {
                id: food.id,
                quantity: { gte: deductAmount },
            },
            data: {
                quantity: { decrement: deductAmount },
            },
        });

        if (updated.count === 0) {
            throw new InventoryRuleError(
                `Estoque insuficiente para "${food.label}" (#${food.batch}). Disponível: ${food.quantity}.`,
            );
        }

        await tx.foodHistory.create({
            data: {
                foodId: food.id,
                foodLabel: food.label,
                foodBatch: food.batch,
                type: "out",
                quantity: deductAmount,
                description:
                    deductAmount === 1
                        ? `1 unidade de ${food.label} retirada na cesta ${basketName}`
                        : `${deductAmount} unidades de ${food.label} retiradas na cesta ${basketName}`,
                createdById: actor.id,
                createdByName: actor.name,
            },
        });
    }
}

async function verifyFoodsExist(tx: Prisma.TransactionClient, foodIds: string[]): Promise<boolean> {
    if (foodIds.length === 0) {
        return true;
    }

    const rows = await tx.food.findMany({
        where: { id: { in: foodIds } },
        select: { id: true },
    });

    return rows.length === foodIds.length;
}

function deduplicateIds(ids: string[]): string[] {
    return Array.from(new Set(ids));
}

function formatBasketInDescription(quantity: number): string {
    return quantity === 1
        ? "1 cesta adicionada manualmente"
        : `${quantity} cestas adicionadas manualmente`;
}

function formatBasketOutDescription(quantity: number): string {
    return quantity === 1 ? "Cesta retirada" : `${quantity} cestas retiradas`;
}

function isUniqueError(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}
