"use server";

import { revalidatePath, updateTag } from "next/cache";

import { writeActionClient } from "@/lib/safe-action";
import { USER_CACHE_TAG, createMember, updateMember } from "@/services/user/user.service";
import { memberFormSchema, updateMemberSchema } from "./schema";

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
