import { z } from "zod";

import { parseBrazilianDateInput } from "@/lib/date-br";
import { foodTypes } from "@/services/food/food.type";

function requiredChoice(values: readonly string[], message: string) {
    return z.string().trim().refine((value) => values.includes(value), message);
}

const foodIdsSchema = z.array(z.string().trim().min(1)).superRefine((ids, ctx) => {
    const seen = new Set<string>();

    ids.forEach((id, index) => {
        if (seen.has(id)) {
            ctx.addIssue({
                code: "custom",
                message: "Alimento duplicado.",
                path: [index],
            });
            return;
        }

        seen.add(id);
    });
});

export const createBasketSchema = z.object({
    templateId: z.string().trim().min(1, "Selecione o modelo da cesta."),
    quantity: z.number().int("Informe uma quantidade inteira.").min(1, "A quantidade mínima é 1."),
    foodIds: foodIdsSchema,
});

export const updateBasketSchema = z.object({
    id: z.string().trim().min(1, "Cesta inválida."),
    templateId: z.string().trim().min(1, "Selecione o modelo da cesta."),
    quantity: z.number().int("Informe uma quantidade inteira.").min(0, "A quantidade não pode ser negativa."),
    foodIds: foodIdsSchema,
});

export const basketTemplateSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, "Informe um nome com ao menos 3 caracteres.")
        .max(120, "O nome deve ter no máximo 120 caracteres."),
    foodIds: foodIdsSchema.min(1, "Selecione ao menos um alimento para o modelo."),
});

export const updateBasketTemplateSchema = basketTemplateSchema.extend({
    id: z.string().trim().min(1, "Modelo inválido."),
});

const adminPasswordSchema = z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres.");

export const deleteBasketTemplateSchema = z.object({
    id: z.string().trim().min(1, "Modelo inválido."),
    password: adminPasswordSchema,
});

export const deleteBasketSchema = z.object({
    id: z.string().trim().min(1, "Cesta inválida."),
    password: adminPasswordSchema,
});

export const deleteFoodSchema = z.object({
    id: z.string().trim().min(1, "Alimento inválido."),
    password: adminPasswordSchema,
});

export const createFoodSchema = z.object({
    label: z
        .string()
        .trim()
        .min(2, "Informe o rótulo do alimento.")
        .max(120, "O rótulo deve ter no máximo 120 caracteres."),
    type: requiredChoice(foodTypes, "Selecione o tipo de alimento."),
    expiresAt: z
        .string()
        .trim()
        .refine(
            (value) => value === "" || parseBrazilianDateInput(value) !== null,
            "Informe uma data válida no formato DD/MM/AAAA.",
        ),
    brand: z.string().trim().max(120, "A marca deve ter no máximo 120 caracteres."),
    quantity: z.number().int("Informe uma quantidade inteira.").min(1, "A quantidade mínima é 1."),
    productCode: z.string().trim().max(120, "O código do produto deve ter no máximo 120 caracteres."),
});

export const editFoodFormSchema = createFoodSchema.extend({
    quantity: z.number().int("Informe uma quantidade inteira.").min(0, "A quantidade não pode ser negativa."),
});

export const updateFoodSchema = editFoodFormSchema.extend({
    id: z.string().trim().min(1, "Alimento inválido."),
});

export type CreateBasketFormValues = z.infer<typeof createBasketSchema>;
export type UpdateBasketFormValues = z.infer<typeof updateBasketSchema>;
export type BasketTemplateFormValues = z.infer<typeof basketTemplateSchema>;
export type UpdateBasketTemplateFormValues = z.infer<typeof updateBasketTemplateSchema>;
export type CreateFoodFormValues = z.infer<typeof createFoodSchema>;
export type UpdateFoodFormValues = z.infer<typeof updateFoodSchema>;

export const emptyCreateBasketFormValues: CreateBasketFormValues = {
    templateId: "new",
    quantity: 1,
    foodIds: [],
};

export const emptyBasketTemplateFormValues: BasketTemplateFormValues = {
    name: "",
    foodIds: [],
};

export const emptyCreateFoodFormValues: CreateFoodFormValues = {
    label: "",
    type: "",
    expiresAt: "",
    brand: "",
    quantity: 1,
    productCode: "",
};
