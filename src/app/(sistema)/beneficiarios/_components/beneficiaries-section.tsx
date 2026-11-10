import { redirect } from "next/navigation";

import { BeneficiariesPanel } from "@/app/(sistema)/beneficiarios/_components/beneficiaries-panel";
import { getCurrentUser } from "@/lib/current-user";
import { hasReadAccess, hasWriteAccess } from "@/lib/member-access";
import { listBeneficiaries } from "@/services/beneficiary/beneficiary.service";

export async function BeneficiariesSection() {
    const user = await getCurrentUser();

    if (!hasReadAccess(user)) {
        redirect("/inicio");
    }

    const beneficiaries = await listBeneficiaries();

    return (
        <BeneficiariesPanel
            beneficiaries={beneficiaries}
            canWrite={hasWriteAccess(user)}
        />
    );
}
