"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { BeneficiaryDrawer } from "@/app/(sistema)/beneficiarios/_components/beneficiary-drawer";
import { ResultDialog } from "@/components/shared/result-dialog";
import { Button } from "@/components/ui/button";
import { useMemberAccess } from "@/hooks/use-member-access";
import type { BeneficiaryAssistantRecord, BeneficiaryRecord } from "@/services/beneficiary/beneficiary.type";

export function BeneficiaryEditor({
    beneficiary,
    assistants,
    canWrite: initialCanWrite,
}: {
    beneficiary: BeneficiaryRecord;
    assistants: BeneficiaryAssistantRecord[];
    canWrite: boolean;
}) {
    const router = useRouter();
    const access = useMemberAccess();
    const canWrite = access.isPending ? initialCanWrite : access.canWrite;
    const [open, setOpen] = useState(false);
    const [savedMessage, setSavedMessage] = useState<string | null>(null);

    if (!canWrite) {
        return null;
    }

    return (
        <>
            <Button type="button" variant="outline" onClick={() => setOpen(true)}>
                <HugeiconsIcon icon={Edit03Icon} strokeWidth={2} />
                Editar
            </Button>
            <BeneficiaryDrawer
                open={open}
                beneficiary={beneficiary}
                assistants={assistants}
                onOpenChange={setOpen}
                onSaved={(message) => {
                    setOpen(false);
                    setSavedMessage(message);
                    router.refresh();
                }}
                onDeleted={() => {
                    router.push("/beneficiarios");
                }}
            />
            <ResultDialog
                status="success"
                open={savedMessage !== null}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) {
                        setSavedMessage(null);
                    }
                }}
                title="Beneficiário atualizado!"
                subtitle={savedMessage ?? ""}
            />
        </>
    );
}
