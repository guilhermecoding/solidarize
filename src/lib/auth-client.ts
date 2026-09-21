import { createAuthClient } from "better-auth/react";
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";
import { ac, adminRole, memberRole } from "@/lib/auth-permissions";

export const authClient = createAuthClient({
    plugins: [
        inferAdditionalFields<typeof auth>(),
        adminClient({
            ac,
            roles: {
                admin: adminRole,
                member: memberRole,
            },
        }),
    ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
