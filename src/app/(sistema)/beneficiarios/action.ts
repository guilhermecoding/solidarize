"use server";

import { revalidatePath, updateTag } from "next/cache";

import { beneficiaryReadActionClient, beneficiaryWriteActionClient } from "@/lib/safe-action";
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

function refreshBeneficiaries(id?: string) {
    updateTag(BENEFICIARY_CACHE_TAG);
    revalidatePath("/beneficiarios");
    revalidatePath("/cestas");

    if (id) {
        revalidatePath(`/beneficiarios/${id}`);
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
    .action(async ({ parsedInput }) => {
        const result = await createBeneficiary(toBeneficiaryInput(parsedInput));

        if (result.ok) {
            refreshBeneficiaries(result.data.id);
        }

        return result;
    });

export const updateBeneficiaryAction = beneficiaryWriteActionClient
    .inputSchema(updateBeneficiarySchema)
    .action(async ({ parsedInput }) => {
        const { id, ...values } = parsedInput;
        const result = await updateBeneficiary({
            id,
            ...toBeneficiaryInput(values),
        });

        if (result.ok) {
            refreshBeneficiaries(id);
        }

        return result;
    });

export const deleteBeneficiaryAction = beneficiaryWriteActionClient
    .inputSchema(deleteBeneficiarySchema)
    .action(async ({ parsedInput }) => {
        const result = await deleteBeneficiary(parsedInput.id, parsedInput.password);

        if (result.ok) {
            refreshBeneficiaries(parsedInput.id);
        }

        return result;
    });
