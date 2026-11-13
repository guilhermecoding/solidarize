import { redirect } from "next/navigation";

import { BeneficiariesPanel } from "@/app/(sistema)/beneficiarios/_components/beneficiaries-panel";
import { getCurrentUser } from "@/lib/current-user";
import { hasReadAccess, hasWriteAccess } from "@/lib/member-access";
import { listBeneficiaries } from "@/services/beneficiary/beneficiary.service";
import type { BeneficiaryAssistantRecord } from "@/services/beneficiary/beneficiary.type";
import { listMembers } from "@/services/user/user.service";

export async function BeneficiariesSection() {
    const user = await getCurrentUser();

    if (!hasReadAccess(user)) {
        redirect("/inicio");
    }

    const canWrite = hasWriteAccess(user);
    const [beneficiaries, assistants] = await Promise.all([
        listBeneficiaries(),
        canWrite ? listAssistantOptions() : Promise.resolve([]),
    ]);

    return (
        <BeneficiariesPanel
            beneficiaries={beneficiaries}
            assistants={assistants}
            canWrite={canWrite}
        />
    );
}

async function listAssistantOptions(): Promise<BeneficiaryAssistantRecord[]> {
    const members = await listMembers();

    return members.map((member) => ({
        id: member.id,
        name: member.name,
    }));
}
