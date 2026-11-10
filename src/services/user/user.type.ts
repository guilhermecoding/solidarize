export const userRoles = ["admin", "member"] as const;
export type UserRole = (typeof userRoles)[number];

export const userAccesses = ["active", "inactive"] as const;
export type UserAccess = (typeof userAccesses)[number];

export const userPermissions = ["read", "full"] as const;
export type UserPermission = (typeof userPermissions)[number];

export const userGenders = ["female", "male", "transgender", "other", "unspecified"] as const;
export type UserGender = (typeof userGenders)[number];

export const userRoleLabels: Record<UserRole, string> = {
    admin: "Administrador",
    member: "Membro",
};

export const userAccessLabels: Record<UserAccess, string> = {
    active: "Ativo",
    inactive: "Inativo",
};

export const userPermissionLabels: Record<UserPermission, string> = {
    read: "Leitura",
    full: "Total",
};

export const userGenderLabels: Record<UserGender, string> = {
    female: "Feminino",
    male: "Masculino",
    transgender: "Transgênero",
    other: "Outro",
    unspecified: "Não Definido",
};

export type MemberActor = {
    id: string;
    role?: string | null;
    permission?: string | null;
};

export type Member = {
    id: string;
    name: string;
    cpf: string;
    email: string;
    contact: string;
    address: string;
    dateOfBirth: string;
    gender: UserGender;
    role: UserRole;
    access: UserAccess;
    permission: UserPermission;
};

export type MemberInput = {
    name: string;
    cpf: string;
    email: string;
    contact: string;
    address: string;
    dateOfBirth: string;
    gender: UserGender;
    role: UserRole;
    access: UserAccess;
    permission: UserPermission;
};

export type UpdateMemberInput = MemberInput & {
    id: string;
};

export type DeleteMemberInput = {
    id: string;
    password: string;
};

export type SetMemberPasswordInput = {
    id: string;
    password: string;
    newPassword: string;
};

export type MemberCredentials = {
    email: string;
    password: string;
};
