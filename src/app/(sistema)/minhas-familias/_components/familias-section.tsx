import { FamiliasPanel } from "@/app/(sistema)/minhas-familias/_components/familias-panel";
import { getCurrentUser } from "@/lib/current-user";
import { listAssistedBeneficiaries } from "@/services/beneficiary/beneficiary.service";

/**
 * Carrega os beneficiários vinculados ao usuário logado em ordem alfabética.
 */
export async function FamiliasSection() {
    const user = await getCurrentUser();
    const families = await listAssistedBeneficiaries(user.id);

    return <FamiliasPanel families={families} />;
}
