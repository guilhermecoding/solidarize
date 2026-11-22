import { redirect } from "next/navigation";

import { CestasHubPanel } from "@/app/(sistema)/cestas/_components/cestas-hub-panel";
import { getCurrentUser } from "@/lib/current-user";
import { hasReadAccess, hasWriteAccess } from "@/lib/member-access";
import {
    getNextBasketName,
    listAvailableBaskets,
    listBasketTemplates,
} from "@/services/basket/basket.service";
import { listBeneficiaryOptions } from "@/services/beneficiary/beneficiary.service";
import { listAvailableFoods, listFoodOptions } from "@/services/food/food.service";

/**
 * Carrega sessão, permissões e dados iniciais para o hub de Cestas e Alimentos.
 */
export async function CestasHubSection() {
    const user = await getCurrentUser();

    if (!hasReadAccess(user)) {
        redirect("/");
    }

    const canWrite = hasWriteAccess(user);

    const [
        templates,
        foods,
        nextBasketName,
        availableBaskets,
        availableFoods,
        beneficiaries,
    ] = canWrite
        ? await Promise.all([
            listBasketTemplates(),
            listFoodOptions(),
            getNextBasketName(),
            listAvailableBaskets(),
            listAvailableFoods(),
            listBeneficiaryOptions(),
        ])
        : [[], [], "", [], [], []];

    return (
        <CestasHubPanel
            canWrite={canWrite}
            nextBasketName={nextBasketName}
            templates={templates}
            foods={foods}
            availableBaskets={availableBaskets}
            availableFoods={availableFoods}
            beneficiaries={beneficiaries}
        />
    );
}
