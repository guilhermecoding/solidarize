import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { BeneficiaryEditor } from "@/app/(sistema)/beneficiarios/[id]/_components/beneficiary-editor";
import { BeneficiaryRecordView } from "@/app/(sistema)/beneficiarios/_components/beneficiary-record";
import TitlePage from "@/components/title-page";
import { getCurrentUser } from "@/lib/current-user";
import { hasReadAccess, hasWriteAccess } from "@/lib/member-access";
import { getBeneficiary } from "@/services/beneficiary/beneficiary.service";
import type { BeneficiaryAssistantRecord } from "@/services/beneficiary/beneficiary.type";
import { listMembers } from "@/services/user/user.service";

export async function BeneficiaryDetailSection({ id }: { id: string }) {
    const user = await getCurrentUser();

    if (!hasReadAccess(user)) {
        redirect("/inicio");
    }

    const canWrite = hasWriteAccess(user);
    const [beneficiary, assistants] = await Promise.all([
        getBeneficiary(id),
        canWrite ? listAssistantOptions() : Promise.resolve([]),
    ]);

    if (!beneficiary) {
        notFound();
    }

    return (
        <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <TitlePage
                    title={beneficiary.name}
                    description="Informações do beneficiário assistido."
                />
                <BeneficiaryEditor
                    beneficiary={beneficiary}
                    assistants={assistants}
                    canWrite={canWrite}
                />
            </div>
            <BeneficiaryRecordView beneficiary={beneficiary} />
        </>
    );
}

async function listAssistantOptions(): Promise<BeneficiaryAssistantRecord[]> {
    const members = await listMembers();

    return members.map((member) => ({
        id: member.id,
        name: member.name,
    }));
}
