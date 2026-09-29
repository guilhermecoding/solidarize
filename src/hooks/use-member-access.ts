"use client";

import { useSession } from "@/lib/auth-client";
import { hasReadAccess, hasWriteAccess } from "@/lib/member-access";

export function useMemberAccess() {
    const { data, isPending } = useSession();
    const actor = data?.user
        ? {
            id: data.user.id,
            role: data.user.role,
            permission: data.user.permission,
        }
        : null;

    return {
        isPending,
        canRead: actor ? hasReadAccess(actor) : false,
        canWrite: actor ? hasWriteAccess(actor) : false,
    };
}
