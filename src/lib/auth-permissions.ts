import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements, userAc } from "better-auth/plugins/admin/access";

const statement = {
    ...defaultStatements,
} as const;

export const ac = createAccessControl(statement);

export const memberRole = ac.newRole({
    ...userAc.statements,
});

export const adminRole = ac.newRole({
    ...adminAc.statements,
});
