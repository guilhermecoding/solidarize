import { redirect } from "next/navigation";

import { MembersPanel } from "@/app/(sistema)/membros/_components/members-panel";
import { getCurrentUser } from "@/lib/current-user";
import { hasReadAccess, hasWriteAccess } from "@/lib/member-access";
import { listMembers } from "@/services/user/user.service";

export async function MembersSection() {
    const user = await getCurrentUser();

    if (!hasReadAccess(user)) {
        redirect("/inicio");
    }

    const members = await listMembers();

    return <MembersPanel members={members} canWrite={hasWriteAccess(user)} />;
}
