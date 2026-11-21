"use server";

import { revalidatePath, updateTag } from "next/cache";

import {
    basketTemplateSchema,
    createBasketSchema,
    createFoodSchema,
    deleteBasketTemplateSchema,
    updateBasketSchema,
    updateBasketTemplateSchema,
    updateFoodSchema,
} from "@/app/(sistema)/cestas/schema";
import { inventoryWriteActionClient } from "@/lib/safe-action";
import {
    BASKET_CACHE_TAG,
    BASKET_HISTORY_CACHE_TAG,
    BASKET_TEMPLATE_CACHE_TAG,
    createBasket,
    createBasketTemplate,
    deleteBasketTemplate,
    getFreshNextBasketName,
    updateBasket,
    updateBasketTemplate,
} from "@/services/basket/basket.service";
import {
    FOOD_CACHE_TAG,
    FOOD_HISTORY_CACHE_TAG,
    createFood,
    updateFood,
} from "@/services/food/food.service";

function refreshInventory({
    baskets = false,
    templates = false,
    basketHistory = false,
    foods = false,
    foodHistory = false,
}: {
    baskets?: boolean;
    templates?: boolean;
    basketHistory?: boolean;
    foods?: boolean;
    foodHistory?: boolean;
}) {
    if (baskets) {
        updateTag(BASKET_CACHE_TAG);
        revalidatePath("/cestas/listar");
    }

    if (templates) {
        updateTag(BASKET_TEMPLATE_CACHE_TAG);
        revalidatePath("/cestas/modelos");
    }

    if (basketHistory) {
        updateTag(BASKET_HISTORY_CACHE_TAG);
        revalidatePath("/cestas/historico");
    }

    if (foods) {
        updateTag(FOOD_CACHE_TAG);
        revalidatePath("/cestas/alimentos/listar");
        revalidatePath("/cestas/modelos");
    }

    if (foodHistory) {
        updateTag(FOOD_HISTORY_CACHE_TAG);
        revalidatePath("/cestas/alimentos/historico");
    }

    revalidatePath("/cestas");
}

export const getNextBasketNameAction = inventoryWriteActionClient.action(async () => {
    return getFreshNextBasketName();
});

export const createBasketAction = inventoryWriteActionClient
    .inputSchema(createBasketSchema)
    .action(async ({ parsedInput, ctx }) => {
        const result = await createBasket(
            { id: ctx.actor.id, name: ctx.actor.name },
            parsedInput,
        );

        if (result.ok) {
            const hasFoods = parsedInput.foodIds.length > 0;
            refreshInventory({
                baskets: true,
                basketHistory: true,
                foods: hasFoods,
                foodHistory: hasFoods,
            });
        }

        return result;
    });

export const updateBasketAction = inventoryWriteActionClient
    .inputSchema(updateBasketSchema)
    .action(async ({ parsedInput, ctx }) => {
        const result = await updateBasket(
            { id: ctx.actor.id, name: ctx.actor.name },
            parsedInput,
        );

        if (result.ok) {
            refreshInventory({
                baskets: true,
                basketHistory: true,
                foods: true,
                foodHistory: true,
            });
        }

        return result;
    });

export const createBasketTemplateAction = inventoryWriteActionClient
    .inputSchema(basketTemplateSchema)
    .action(async ({ parsedInput, ctx }) => {
        const result = await createBasketTemplate(
            { id: ctx.actor.id, name: ctx.actor.name },
            parsedInput,
        );

        if (result.ok) {
            refreshInventory({ templates: true });
        }

        return result;
    });

export const updateBasketTemplateAction = inventoryWriteActionClient
    .inputSchema(updateBasketTemplateSchema)
    .action(async ({ parsedInput }) => {
        const result = await updateBasketTemplate(parsedInput);

        if (result.ok) {
            refreshInventory({ templates: true, baskets: true });
        }

        return result;
    });

export const deleteBasketTemplateAction = inventoryWriteActionClient
    .inputSchema(deleteBasketTemplateSchema)
    .action(async ({ parsedInput }) => {
        const result = await deleteBasketTemplate(parsedInput.id);

        if (result.ok) {
            refreshInventory({ templates: true, baskets: true });
        }

        return result;
    });

export const createFoodAction = inventoryWriteActionClient
    .inputSchema(createFoodSchema)
    .action(async ({ parsedInput, ctx }) => {
        const result = await createFood(
            { id: ctx.actor.id, name: ctx.actor.name },
            parsedInput,
        );

        if (result.ok) {
            refreshInventory({ foods: true, foodHistory: true });
        }

        return result;
    });

export const updateFoodAction = inventoryWriteActionClient
    .inputSchema(updateFoodSchema)
    .action(async ({ parsedInput, ctx }) => {
        const result = await updateFood(
            { id: ctx.actor.id, name: ctx.actor.name },
            parsedInput,
        );

        if (result.ok) {
            refreshInventory({ foods: true, foodHistory: true, templates: true });
        }

        return result;
    });
