"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { BasketDrawer } from "@/app/(sistema)/cestas/_components/basket-drawer";
import { FoodDrawer } from "@/app/(sistema)/cestas/_components/food-drawer";
import { ModuleSection } from "@/app/(sistema)/cestas/_components/module-section";
import { WithdrawBasketDrawer } from "@/app/(sistema)/cestas/_components/withdraw-basket-drawer";
import { WithdrawFoodDrawer } from "@/app/(sistema)/cestas/_components/withdraw-food-drawer";
import {
    basketModules,
    foodModules,
    type HubAction,
} from "@/app/(sistema)/cestas/_config/modules";
import { ResultDialog } from "@/components/shared/result-dialog";
import { useMemberAccess } from "@/hooks/use-member-access";
import type { BasketRecord, BasketTemplateRecord } from "@/services/basket/basket.type";
import type { BeneficiaryOptionRecord } from "@/services/beneficiary/beneficiary.type";
import type { FoodOptionRecord, FoodRecord } from "@/services/food/food.type";

type CestasHubPanelProps = {
    canWrite: boolean;
    nextBasketName: string;
    templates: BasketTemplateRecord[];
    foods: FoodOptionRecord[];
    availableBaskets: BasketRecord[];
    availableFoods: FoodRecord[];
    beneficiaries: BeneficiaryOptionRecord[];
};

/**
 * Painel interativo do hub de Cestas e Alimentos que coordena os dialogs de cadastro e retirada.
 */
export function CestasHubPanel({
    canWrite: initialCanWrite,
    nextBasketName,
    templates,
    foods,
    availableBaskets,
    availableFoods,
    beneficiaries,
}: CestasHubPanelProps) {
    const router = useRouter();
    const access = useMemberAccess();
    const canWrite = access.isPending ? initialCanWrite : access.canWrite;

    const [activeAction, setActiveAction] = useState<HubAction | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    function handleSuccess(message: string) {
        setActiveAction(null);
        setSuccessMessage(message);
        router.refresh();
    }

    return (
        <>
            <ModuleSection
                group={basketModules}
                canWrite={canWrite}
                onAction={(action) => {
                    if (canWrite) {
                        setActiveAction(action);
                    }
                }}
            />
            <ModuleSection
                group={foodModules}
                canWrite={canWrite}
                onAction={(action) => {
                    if (canWrite) {
                        setActiveAction(action);
                    }
                }}
            />

            {canWrite ? (
                <>
                    <BasketDrawer
                        open={activeAction === "new-basket"}
                        basket={null}
                        nextBasketName={nextBasketName}
                        templates={templates}
                        foods={foods}
                        onOpenChange={(nextOpen) => {
                            if (!nextOpen) {
                                setActiveAction(null);
                            }
                        }}
                        onSaved={handleSuccess}
                    />
                    <FoodDrawer
                        open={activeAction === "new-food"}
                        onOpenChange={(nextOpen) => {
                            if (!nextOpen) {
                                setActiveAction(null);
                            }
                        }}
                        onSaved={handleSuccess}
                    />
                    <WithdrawBasketDrawer
                        open={activeAction === "withdraw-basket"}
                        baskets={availableBaskets}
                        beneficiaries={beneficiaries}
                        onOpenChange={(nextOpen) => {
                            if (!nextOpen) {
                                setActiveAction(null);
                            }
                        }}
                        onSaved={handleSuccess}
                    />
                    <WithdrawFoodDrawer
                        open={activeAction === "withdraw-food"}
                        foods={availableFoods}
                        beneficiaries={beneficiaries}
                        onOpenChange={(nextOpen) => {
                            if (!nextOpen) {
                                setActiveAction(null);
                            }
                        }}
                        onSaved={handleSuccess}
                    />
                </>
            ) : null}

            <ResultDialog
                status="success"
                open={successMessage !== null}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) {
                        setSuccessMessage(null);
                    }
                }}
                title="Deu certo!"
                subtitle={successMessage ?? ""}
            />
        </>
    );
}
