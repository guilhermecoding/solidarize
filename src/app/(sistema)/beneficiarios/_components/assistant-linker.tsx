"use client";

import { useState } from "react";

import SeparatorSection from "@/components/separator-section";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import type { BeneficiaryAssistantRecord } from "@/services/beneficiary/beneficiary.type";

const PICKER_TITLE = "Vincular beneficiário à assistentes";
const PICKER_DESCRIPTION = "Vincule este beneficiário a um ou mais assistentes";

export function AssistantLinker({
    assistants,
    selectedIds,
    onChange,
}: {
    assistants: BeneficiaryAssistantRecord[];
    selectedIds: string[];
    onChange: (ids: string[]) => void;
}) {
    const isMobile = useIsMobile();
    const [open, setOpen] = useState(false);
    const selected = new Set(selectedIds);
    const linked = assistants
        .filter((assistant) => selected.has(assistant.id))
        .toSorted((left, right) => left.name.localeCompare(right.name, "pt-BR"));
    const listed = assistants.toSorted((left, right) => {
        const leftSelected = selected.has(left.id);
        const rightSelected = selected.has(right.id);

        if (leftSelected !== rightSelected) {
            return leftSelected ? -1 : 1;
        }

        return left.name.localeCompare(right.name, "pt-BR");
    });

    function toggle(id: string, checked: boolean) {
        if (checked) {
            onChange(selectedIds.includes(id) ? selectedIds : [...selectedIds, id]);
            return;
        }

        onChange(selectedIds.filter((current) => current !== id));
    }

    const picker = isMobile ? (
        <Drawer open={open} onOpenChange={setOpen} swipeDirection="down">
            <DrawerContent>
                <DrawerHeader className="text-left">
                    <DrawerTitle className="text-xl font-bold">{PICKER_TITLE}</DrawerTitle>
                    <DrawerDescription>{PICKER_DESCRIPTION}</DrawerDescription>
                </DrawerHeader>
                <AssistantList assistants={listed} selected={selected} onToggle={toggle} />
            </DrawerContent>
        </Drawer>
    ) : (
        <Dialog open={open} onOpenChange={setOpen} disablePointerDismissal>
            <DialogContent
                overlayClassName="z-[60]"
                className="z-[60] flex max-h-[calc(100dvh-2rem)] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
            >
                <DialogHeader className="shrink-0 px-6 pt-6 pr-14">
                    <DialogTitle className="text-xl font-bold">{PICKER_TITLE}</DialogTitle>
                    <DialogDescription>{PICKER_DESCRIPTION}</DialogDescription>
                </DialogHeader>
                <AssistantList assistants={listed} selected={selected} onToggle={toggle} />
            </DialogContent>
        </Dialog>
    );

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="min-w-0 sm:flex-1">
                    <SeparatorSection title="Assistentes" />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    className="w-full shrink-0 sm:w-auto"
                    onClick={() => setOpen(true)}
                >
                    Vincular
                </Button>
            </div>
            {linked.length === 0 ? (
                <p className="text-muted-foreground">Nenhum assistente vinculado</p>
            ) : (
                <div className="flex flex-col gap-3">
                    {linked.map((assistant) => (
                        <div key={assistant.id} className="rounded-2xl border p-4">
                            <p className="font-medium">{assistant.name}</p>
                        </div>
                    ))}
                </div>
            )}
            {picker}
        </div>
    );
}

function AssistantList({
    assistants,
    selected,
    onToggle,
}: {
    assistants: BeneficiaryAssistantRecord[];
    selected: Set<string>;
    onToggle: (id: string, checked: boolean) => void;
}) {
    if (assistants.length === 0) {
        return <p className="px-6 py-4 text-muted-foreground">Nenhum membro do sistema.</p>;
    }

    return (
        <div className="flex max-h-[calc(100dvh-12rem)] min-h-0 flex-col gap-2 overflow-y-auto px-6 py-4">
            {assistants.map((assistant) => (
                <label
                    key={assistant.id}
                    className="flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3"
                >
                    <Checkbox
                        checked={selected.has(assistant.id)}
                        onCheckedChange={(checked) => onToggle(assistant.id, checked === true)}
                    />
                    <span className="font-medium">{assistant.name}</span>
                </label>
            ))}
        </div>
    );
}
