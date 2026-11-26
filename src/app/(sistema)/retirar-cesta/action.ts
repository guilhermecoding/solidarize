"use server";

import { revalidatePath, updateTag } from "next/cache";

import { withdrawAssistedBasketsSchema } from "@/app/(sistema)/cestas/schema";
import { authActionClient } from "@/lib/safe-action";
import {
    BASKET_CACHE_TAG,
    BASKET_HISTORY_CACHE_TAG,
    withdrawAssistedBaskets,
} from "@/services/basket/basket.service";

/**
 * Registra a retirada de cestas realizada na seção Para Você para um beneficiário vinculado e aprovado.
 */
export const withdrawAssistedBasketsAction = authActionClient
    .inputSchema(withdrawAssistedBasketsSchema)
    .action(async ({ parsedInput, ctx }) => {
        const result = await withdrawAssistedBaskets(
            { id: ctx.actor.id, name: ctx.actor.name },
            parsedInput,
        );

        if (result.ok) {
            updateTag(BASKET_CACHE_TAG);
            updateTag(BASKET_HISTORY_CACHE_TAG);
            revalidatePath("/retirar-cesta");
            revalidatePath("/cestas");
            revalidatePath("/cestas/listar");
            revalidatePath("/cestas/historico");
            revalidatePath("/minhas-familias");
            revalidatePath(`/minhas-familias/${parsedInput.beneficiaryId}`);
        }

        return result;
    });
