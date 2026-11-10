import { headers } from "next/headers";
import { createSafeActionClient } from "next-safe-action";

import { auth } from "@/lib/auth";
import { hasReadAccess, hasWriteAccess } from "@/lib/member-access";
import type { MemberActor } from "@/services/user/user.type";

export class ActionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ActionError";
    }
}

export const actionClient = createSafeActionClient({
    handleServerError(error) {
        console.error(error);

        if (error instanceof ActionError) {
            return error.message;
        }

        return "Algo deu errado. Tente novamente.";
    },
});

async function getActor(): Promise<MemberActor | null> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return null;
    }

    return {
        id: session.user.id,
        role: session.user.role,
        permission: session.user.permission,
    };
}

export const authActionClient = actionClient.use(async ({ next }) => {
    const actor = await getActor();

    if (!actor) {
        throw new ActionError("Você precisa estar autenticado.");
    }

    return next({ ctx: { actor } });
});

export const readActionClient = authActionClient.use(async ({ next, ctx }) => {
    if (!hasReadAccess(ctx.actor)) {
        throw new ActionError("Você não tem permissão para consultar membros.");
    }

    return next();
});

export const writeActionClient = authActionClient.use(async ({ next, ctx }) => {
    if (!hasWriteAccess(ctx.actor)) {
        throw new ActionError("Você não tem permissão para alterar membros.");
    }

    return next();
});
