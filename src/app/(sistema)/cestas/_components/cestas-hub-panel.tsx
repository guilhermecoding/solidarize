"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { BasketDrawer } from "@/app/(sistema)/cestas/_components/basket-drawer";
import { BasketTemplateDrawer } from "@/app/(sistema)/cestas/_components/basket-template-drawer";
import { FoodDrawer } from "@/app/(sistema)/cestas/_components/food-drawer";
import { ModuleSection } from "@/app/(sistema)/cestas/_components/module-section";
import {
    basketModules,
    foodModules,
    type HubAction,
} from "@/app/(sistema)/cestas/_config/modules";
import { ResultDialog } from "@/components/shared/result-dialog";
import { useMemberAccess } from "@/hooks/use-member-access";
import type { BasketTemplateRecord } from "@/services/basket/basket.type";
import type { FoodOptionRecord } from "@/services/food/food.type";

type CestasHubPanelProps = {
    canWrite: boolean;
    nextBasketName: string;
    templates: BasketTemplateRecord[];
    foods: FoodOptionRecord[];
};

/**
 * Painel interativo do hub de Cestas e Alimentos que coordena os dialogs de cadastro.
 */
export function CestasHubPanel({
    canWrite: initialCanWrite,
    nextBasketName,
    templates,
    foods,
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
                    <BasketTemplateDrawer
                        open={activeAction === "basket-templates"}
                        templates={templates}
                        foods={foods}
                        onOpenChange={(nextOpen) => {
                            if (!nextOpen) {
                                setActiveAction(null);
                            }
                        }}
                        onChanged={handleSuccess}
                    />
                    <FoodDrawer
                        open={activeAction === "new-food"}
                        onOpenChange={(nextOpen) => {
                            if (!nextOpen) {
                                setActiveAction(null);
                            }
                        }}
                        onCreated={handleSuccess}
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
