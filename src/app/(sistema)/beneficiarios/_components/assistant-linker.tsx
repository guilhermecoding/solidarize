"use client";

import { useState } from "react";
import { ArrowLeft01Icon, ArrowRight01Icon, UserSwitchIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import SeparatorSection from "@/components/separator-section";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import type { BeneficiaryAssistantRecord } from "@/services/beneficiary/beneficiary.type";

const PAGE_SIZE = 10;
const PICKER_TITLE = "Vincular beneficiário à assistentes";
const PICKER_DESCRIPTION = "Vincule este beneficiário a um ou mais assistentes";

export function AssistantLinker({
    assistants,
    selectedIds,
    onOpen,
}: {
    assistants: BeneficiaryAssistantRecord[];
    selectedIds: string[];
    onOpen: () => void;
}) {
    const selected = new Set(selectedIds);
    const linked = assistants
        .filter((assistant) => selected.has(assistant.id))
        .toSorted((left, right) => left.name.localeCompare(right.name, "pt-BR"));

    return (
        <div className="flex flex-col gap-4">
            <SeparatorSection title="Assistentes" />
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
            <Button type="button" variant="outline" onClick={onOpen}>
                <HugeiconsIcon icon={UserSwitchIcon} strokeWidth={2} />
                Vincular assistentes
            </Button>
        </div>
    );
}

export function AssistantPicker({
    open,
    session,
    mobile,
    assistants,
    selectedIds,
    onCancel,
    onConfirm,
}: {
    open: boolean;
    session: number;
    mobile: boolean;
    assistants: BeneficiaryAssistantRecord[];
    selectedIds: string[];
    onCancel: () => void;
    onConfirm: (ids: string[]) => void;
}) {
    const [seenSession, setSeenSession] = useState(session);
    const [draftIds, setDraftIds] = useState(selectedIds);
    const [page, setPage] = useState(1);

    if (session !== seenSession) {
        setSeenSession(session);
        setDraftIds(selectedIds);
        setPage(1);
    }
    const pinned = new Set(selectedIds);
    const draft = new Set(draftIds);
    const listed = assistants.toSorted((left, right) => {
        const leftSelected = pinned.has(left.id);
        const rightSelected = pinned.has(right.id);

        if (leftSelected !== rightSelected) {
            return leftSelected ? -1 : 1;
        }

        return left.name.localeCompare(right.name, "pt-BR");
    });

    function toggle(id: string, checked: boolean) {
        setDraftIds((current) => {
            if (checked) {
                return current.includes(id) ? current : [...current, id];
            }

            return current.filter((currentId) => currentId !== id);
        });
    }

    return (
        <AssistantPickerSurface
            open={open}
            mobile={mobile}
            assistants={listed}
            selected={draft}
            page={page}
            onPageChange={setPage}
            onToggle={toggle}
            onCancel={onCancel}
            onConfirm={() => onConfirm(draftIds)}
        />
    );
}

function AssistantPickerSurface({
    open,
    mobile,
    assistants,
    selected,
    page,
    onPageChange,
    onToggle,
    onCancel,
    onConfirm,
}: {
    open: boolean;
    mobile: boolean;
    assistants: BeneficiaryAssistantRecord[];
    selected: Set<string>;
    page: number;
    onPageChange: (page: number) => void;
    onToggle: (id: string, checked: boolean) => void;
    onCancel: () => void;
    onConfirm: () => void;
}) {
    const pageCount = Math.max(1, Math.ceil(assistants.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const pageAssistants = assistants.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const showPager = assistants.length > PAGE_SIZE;
    const inset = mobile ? "px-4" : "px-6";
    const list = (
        <AssistantList
            assistants={pageAssistants}
            selected={selected}
            inset={inset}
            onToggle={onToggle}
            empty={assistants.length === 0}
        />
    );
    const pager = showPager ? (
        <div className={cn("flex shrink-0 items-center justify-end gap-1 pb-4", inset)}>
            <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="border-foreground/20"
                aria-label="Página anterior"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
            </Button>
            <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="border-foreground/20"
                aria-label="Próxima página"
                disabled={currentPage === pageCount}
                onClick={() => onPageChange(currentPage + 1)}
            >
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
            </Button>
        </div>
    ) : null;

    if (mobile) {
        return (
            <Drawer open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onCancel(); }} swipeDirection="down" showSwipeHandle>
                <DrawerContent overlayClassName="z-[60]" viewportClassName="z-[60]">
                    <DrawerHeader className="text-left">
                        <DrawerTitle className="text-xl font-bold">{PICKER_TITLE}</DrawerTitle>
                        <DrawerDescription>{PICKER_DESCRIPTION}</DrawerDescription>
                    </DrawerHeader>
                    {list}
                    {pager}
                    <DrawerFooter>
                        <Button type="button" onClick={onConfirm}>
                            Confirmar
                        </Button>
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancelar
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onCancel(); }} disablePointerDismissal>
            <DialogContent
                overlayClassName="z-[60]"
                className="z-60 flex max-h-[calc(100dvh-2rem)] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
            >
                <DialogHeader className="shrink-0 px-6 pt-6 pr-14">
                    <DialogTitle className="text-xl font-bold">{PICKER_TITLE}</DialogTitle>
                    <DialogDescription>{PICKER_DESCRIPTION}</DialogDescription>
                </DialogHeader>
                {list}
                {pager}
                <DialogFooter className="shrink-0 border-t px-6 py-4 sm:justify-end">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button type="button" onClick={onConfirm}>
                        Confirmar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function AssistantList({
    assistants,
    selected,
    onToggle,
    inset,
    empty,
}: {
    assistants: BeneficiaryAssistantRecord[];
    selected: Set<string>;
    onToggle: (id: string, checked: boolean) => void;
    inset: string;
    empty: boolean;
}) {
    if (empty) {
        return <p className={cn("py-4 text-muted-foreground", inset)}>Nenhum membro do sistema.</p>;
    }

    return (
        <div className={cn("flex min-h-0 flex-col gap-2 overflow-y-auto py-4", inset)}>
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
