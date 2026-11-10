"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { BeneficiaryDrawer } from "@/app/(sistema)/beneficiarios/_components/beneficiary-drawer";
import { Button } from "@/components/ui/button";
import { useMemberAccess } from "@/hooks/use-member-access";
import { notify } from "@/lib/notify";
import type { BeneficiaryRecord } from "@/services/beneficiary/beneficiary.type";

export function BeneficiaryEditor({
    beneficiary,
    canWrite: initialCanWrite,
}: {
    beneficiary: BeneficiaryRecord;
    canWrite: boolean;
}) {
    const router = useRouter();
    const access = useMemberAccess();
    const canWrite = access.isPending ? initialCanWrite : access.canWrite;
    const [open, setOpen] = useState(false);

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
                onOpenChange={setOpen}
                onSaved={(message) => {
                    setOpen(false);
                    notify("success", message);
                    router.refresh();
                }}
                onDeleted={() => {
                    router.push("/beneficiarios");
                }}
            />
        </>
    );
}
