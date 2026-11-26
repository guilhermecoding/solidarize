"use server";

import { revalidatePath, updateTag } from "next/cache";

import { beneficiaryReadActionClient, beneficiaryWriteActionClient } from "@/lib/safe-action";
import { AUDIT_LOG_CACHE_TAG } from "@/services/audit/audit.service";
import {
    BENEFICIARY_CACHE_TAG,
    createBeneficiary,
    deleteBeneficiary,
    searchBeneficiaries,
    searchBeneficiaryPlaces,
    updateBeneficiary,
} from "@/services/beneficiary/beneficiary.service";
import {
    beneficiaryFormSchema,
    deleteBeneficiarySchema,
    searchBeneficiariesSchema,
    searchBeneficiaryPlacesSchema,
    toBeneficiaryInput,
    updateBeneficiarySchema,
} from "./schema";

function refreshAudit() {
    updateTag(AUDIT_LOG_CACHE_TAG);
    revalidatePath("/auditoria");
}

function refreshBeneficiaries(id?: string) {
    updateTag(BENEFICIARY_CACHE_TAG);
    revalidatePath("/beneficiarios");
    revalidatePath("/cestas");
    revalidatePath("/retirar-cesta");
    revalidatePath("/minhas-familias");
    revalidatePath("/indicadores");
    refreshAudit();

    if (id) {
        revalidatePath(`/beneficiarios/${id}`);
        revalidatePath(`/minhas-familias/${id}`);
    }
}

export const searchBeneficiariesAction = beneficiaryReadActionClient
    .inputSchema(searchBeneficiariesSchema)
    .action(async ({ parsedInput }) => {
        return searchBeneficiaries(parsedInput.query.replace(/\s+/g, " "));
    });

export const searchBeneficiaryPlacesAction = beneficiaryReadActionClient
    .inputSchema(searchBeneficiaryPlacesSchema)
    .action(async ({ parsedInput }) => {
        return searchBeneficiaryPlaces(
            parsedInput.field,
            parsedInput.query.replace(/\s+/g, " "),
        );
    });

export const createBeneficiaryAction = beneficiaryWriteActionClient
    .inputSchema(beneficiaryFormSchema)
    .action(async ({ parsedInput, ctx }) => {
        const result = await createBeneficiary(
            { id: ctx.actor.id, name: ctx.actor.name },
            toBeneficiaryInput(parsedInput),
        );

        if (result.ok) {
            refreshBeneficiaries(result.data.id);
        }

        return result;
    });

export const updateBeneficiaryAction = beneficiaryWriteActionClient
    .inputSchema(updateBeneficiarySchema)
    .action(async ({ parsedInput, ctx }) => {
        const { id, ...values } = parsedInput;
        const result = await updateBeneficiary(
            { id: ctx.actor.id, name: ctx.actor.name },
            {
                id,
                ...toBeneficiaryInput(values),
            },
        );

        if (result.ok) {
            refreshBeneficiaries(id);
        }

        return result;
    });

export const deleteBeneficiaryAction = beneficiaryWriteActionClient
    .inputSchema(deleteBeneficiarySchema)
    .action(async ({ parsedInput, ctx }) => {
        const result = await deleteBeneficiary(
            { id: ctx.actor.id, name: ctx.actor.name },
            parsedInput.id,
            parsedInput.password,
        );

        if (result.ok) {
            refreshBeneficiaries(parsedInput.id);
        } else {
            refreshAudit();
        }

        return result;
    });
