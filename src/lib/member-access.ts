import type { MemberActor } from "@/services/user/user.type";

export function hasReadAccess(actor: MemberActor): boolean {
    return actor.role === "admin" && (actor.permission === "read" || actor.permission === "full");
}

export function hasWriteAccess(actor: MemberActor): boolean {
    return actor.role === "admin" && actor.permission === "full";
}
