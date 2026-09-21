"use server";

import { headers } from "next/headers";
import { APIError } from "better-auth/api";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";
import { serverFailure, serverSuccess } from "@/@types/server-response";
import { loginSchema } from "./schema";

export const loginAction = actionClient
    .inputSchema(loginSchema)
    .action(async ({ parsedInput: { email, password } }) => {
        try {
            await auth.api.signInEmail({
                body: { email, password },
                headers: await headers(),
            });

            return serverSuccess(undefined, "Login realizado com sucesso.");
        } catch (error) {
            if (error instanceof APIError) {
                return serverFailure("E-mail ou senha inválidos.");
            }

            throw error;
        }
    });
