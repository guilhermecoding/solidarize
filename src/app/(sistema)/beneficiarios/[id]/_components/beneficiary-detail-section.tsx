import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { BeneficiaryEditor } from "@/app/(sistema)/beneficiarios/[id]/_components/beneficiary-editor";
import { BeneficiaryRecordView } from "@/app/(sistema)/beneficiarios/_components/beneficiary-record";
import TitlePage from "@/components/title-page";
import { getCurrentUser } from "@/lib/current-user";
import { hasReadAccess, hasWriteAccess } from "@/lib/member-access";
import { getBeneficiary } from "@/services/beneficiary/beneficiary.service";

export async function BeneficiaryDetailSection({ id }: { id: string }) {
    const user = await getCurrentUser();

    if (!hasReadAccess(user)) {
        redirect("/inicio");
    }

    const beneficiary = await getBeneficiary(id);

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
                    canWrite={hasWriteAccess(user)}
                />
            </div>
            <Link href="/beneficiarios" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
                Voltar para beneficiários
            </Link>
            <BeneficiaryRecordView beneficiary={beneficiary} />
        </>
    );
}
