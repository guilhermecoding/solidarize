"use client";

import { type ReactNode, useState } from "react";
import { useRouter } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type FamiliaDetailTab = "informacoes" | "historico";

type FamiliaDetailTabsProps = {
    beneficiaryId: string;
    activeTab: FamiliaDetailTab;
    infoContent: ReactNode;
    historyContent: ReactNode;
};

/**
 * Alterna entre "Informações do usuário" e "Histórico de entregas" sincronizando a aba na URL.
 */
export function FamiliaDetailTabs({
    beneficiaryId,
    activeTab,
    infoContent,
    historyContent,
}: FamiliaDetailTabsProps) {
    const router = useRouter();
    const [tab, setTab] = useState<FamiliaDetailTab>(activeTab);
    const [prevActiveTab, setPrevActiveTab] = useState<FamiliaDetailTab>(activeTab);

    if (activeTab !== prevActiveTab) {
        setPrevActiveTab(activeTab);
        setTab(activeTab);
    }

    function handleTabChange(nextTab: string | null) {
        if (nextTab === "informacoes" || nextTab === "historico") {
            setTab(nextTab);
            router.replace(`/minhas-familias/${beneficiaryId}?aba=${nextTab}`, { scroll: false });
        }
    }

    return (
        <Tabs value={tab} onValueChange={handleTabChange} className="flex flex-col gap-6">
            <TabsList>
                <TabsTrigger value="informacoes">Informações do usuário</TabsTrigger>
                <TabsTrigger value="historico">Histórico de entregas</TabsTrigger>
            </TabsList>

            <TabsContent value="informacoes">{infoContent}</TabsContent>
            <TabsContent value="historico">{historyContent}</TabsContent>
        </Tabs>
    );
}
