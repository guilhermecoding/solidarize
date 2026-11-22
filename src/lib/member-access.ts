import type { MemberActor } from "@/services/user/user.type";

export function hasReadAccess(actor: MemberActor): boolean {
    return actor.role === "admin" && (actor.permission === "read" || actor.permission === "full");
}

export function hasWriteAccess(actor: MemberActor): boolean {
    return actor.role === "admin" && actor.permission === "full";
}

export function isUserBanned(user: {
    banned?: boolean | null;
    banExpires?: Date | string | null;
}): boolean {
    if (!user.banned) {
        return false;
    }

    if (!user.banExpires) {
        return true;
    }

    const expiresAt = user.banExpires instanceof Date
        ? user.banExpires
        : new Date(user.banExpires);

    return Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() > Date.now();
}
