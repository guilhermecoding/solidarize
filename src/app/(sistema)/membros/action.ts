"use server";

import { revalidatePath, updateTag } from "next/cache";

import { readActionClient, writeActionClient } from "@/lib/safe-action";
import { USER_CACHE_TAG, createMember, searchMembers, updateMember } from "@/services/user/user.service";
import { memberFormSchema, searchMembersSchema, updateMemberSchema } from "./schema";

export const searchMembersAction = readActionClient
    .inputSchema(searchMembersSchema)
    .action(async ({ parsedInput }) => {
        return searchMembers(parsedInput.query.replace(/\s+/g, " "));
    });

export const createMemberAction = writeActionClient
    .inputSchema(memberFormSchema)
    .action(async ({ parsedInput }) => {
        const result = await createMember(parsedInput);

        if (result.ok) {
            updateTag(USER_CACHE_TAG);
            revalidatePath("/membros");
        }

        return result;
    });

export const updateMemberAction = writeActionClient
    .inputSchema(updateMemberSchema)
    .action(async ({ parsedInput, ctx }) => {
        const result = await updateMember(ctx.actor, parsedInput);

        if (result.ok) {
            updateTag(USER_CACHE_TAG);
            revalidatePath("/membros");
        }

        return result;
    });
