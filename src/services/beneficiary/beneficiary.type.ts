import { normalizeCpf } from "@/lib/validate-cpf";

export const beneficiaryGenders = ["female", "male", "transgender", "unspecified"] as const;
export type BeneficiaryGender = (typeof beneficiaryGenders)[number];

export const maritalStatuses = [
    "single",
    "married",
    "stable_union",
    "divorced",
    "widowed",
    "separated",
    "cohabiting",
] as const;
export type MaritalStatus = (typeof maritalStatuses)[number];

export const employments = ["employed", "unemployed"] as const;
export type Employment = (typeof employments)[number];

export const beneficiaryStatuses = ["approved", "rejected"] as const;
export type BeneficiaryStatus = (typeof beneficiaryStatuses)[number];

export const aidTypes = ["food_basket", "financial", "medication", "other"] as const;
export type AidType = (typeof aidTypes)[number];

export const disabilityOptions = ["yes", "no"] as const;
export type DisabilityOption = (typeof disabilityOptions)[number];

export const rentOptions = ["yes", "no"] as const;
export type RentOption = (typeof rentOptions)[number];

export const brazilianStates = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
] as const;
export type BrazilianState = (typeof brazilianStates)[number];

export const kinships = [
    "child",
    "nephew",
    "sibling",
    "father",
    "mother",
    "uncle",
    "grandfather",
    "grandmother",
    "cousin",
    "sibling_in_law",
    "son_in_law",
    "daughter_in_law",
    "parent_in_law",
    "friend",
    "other",
] as const;
export type Kinship = (typeof kinships)[number];

const masculineOnlyKinships = new Set<Kinship>(["father", "grandfather", "son_in_law"]);
const feminineOnlyKinships = new Set<Kinship>(["mother", "grandmother", "daughter_in_law"]);

const masculineKinshipLabels: Record<Kinship, string> = {
    child: "Filho",
    nephew: "Sobrinho",
    sibling: "Irmão",
    father: "Pai",
    mother: "Mãe",
    uncle: "Tio",
    grandfather: "Avô",
    grandmother: "Avó",
    cousin: "Primo",
    sibling_in_law: "Cunhado",
    son_in_law: "Genro",
    daughter_in_law: "Nora",
    parent_in_law: "Sogro",
    friend: "Amigo",
    other: "Outro",
};

const feminineKinshipLabels: Record<Kinship, string> = {
    child: "Filha",
    nephew: "Sobrinha",
    sibling: "Irmã",
    father: "Pai",
    mother: "Mãe",
    uncle: "Tia",
    grandfather: "Avô",
    grandmother: "Avó",
    cousin: "Prima",
    sibling_in_law: "Cunhada",
    son_in_law: "Genro",
    daughter_in_law: "Nora",
    parent_in_law: "Sogra",
    friend: "Amiga",
    other: "Outra",
};

export const beneficiaryGenderLabels: Record<BeneficiaryGender, string> = {
    female: "Feminino",
    male: "Masculino",
    transgender: "Transgênero",
    unspecified: "Não Definido",
};

export const maritalStatusLabels: Record<MaritalStatus, string> = {
    single: "Solteiro",
    married: "Casado",
    stable_union: "União Estável",
    divorced: "Divorciado",
    widowed: "Viúvo",
    separated: "Separado",
    cohabiting: "Amasiado",
};

export const employmentLabels: Record<Employment, string> = {
    employed: "Empregado",
    unemployed: "Desempregado",
};

export const beneficiaryStatusLabels: Record<BeneficiaryStatus, string> = {
    approved: "Aprovado",
    rejected: "Não Aprovado",
};

export const aidTypeLabels: Record<AidType, string> = {
    food_basket: "Cesta Básica",
    financial: "Auxílio Financeiro",
    medication: "Auxílio Medicamento",
    other: "Outra Ajuda",
};

export const disabilityLabels: Record<DisabilityOption, string> = {
    yes: "Possui",
    no: "Não possui",
};

export const rentLabels: Record<RentOption, string> = {
    yes: "Paga",
    no: "Não paga",
};

export const EXPECTED_DELIVERY_DAY_MIN = 1;
export const EXPECTED_DELIVERY_DAY_MAX = 31;

export function formatExpectedDeliveryDayInput(value: string): string {
    return value.replace(/\D/g, "").slice(0, 2);
}

export function parseExpectedDeliveryDay(value: string): number | null {
    const trimmed = value.trim();

    if (!/^\d{1,2}$/.test(trimmed)) {
        return null;
    }

    const day = Number.parseInt(trimmed, 10);

    if (day < EXPECTED_DELIVERY_DAY_MIN || day > EXPECTED_DELIVERY_DAY_MAX) {
        return null;
    }

    return day;
}

export function isValidExpectedDeliveryDay(value: string): boolean {
    return parseExpectedDeliveryDay(value) !== null;
}

export function formatExpectedDeliveryDay(day: number | null): string {
    return day === null ? "" : String(day);
}

export function isBeneficiaryGender(value: string): value is BeneficiaryGender {
    return beneficiaryGenders.some((gender) => gender === value);
}

export function isMaritalStatus(value: string): value is MaritalStatus {
    return maritalStatuses.some((status) => status === value);
}

export function isEmployment(value: string): value is Employment {
    return employments.some((employment) => employment === value);
}

export function isBeneficiaryStatus(value: string): value is BeneficiaryStatus {
    return beneficiaryStatuses.some((status) => status === value);
}

export function isAidType(value: string): value is AidType {
    return aidTypes.some((aidType) => aidType === value);
}

export function isDisabilityOption(value: string): value is DisabilityOption {
    return disabilityOptions.some((option) => option === value);
}

export function isRentOption(value: string): value is RentOption {
    return rentOptions.some((option) => option === value);
}

export function isBrazilianState(value: string): value is BrazilianState {
    return brazilianStates.some((state) => state === value);
}

export function isKinship(value: string): value is Kinship {
    return kinships.some((kinship) => kinship === value);
}

export function isFeminineGender(gender: string): boolean {
    return gender === "female";
}

export function kinshipOptionsForGender(gender: string): Kinship[] {
    const feminine = isFeminineGender(gender);

    return kinships.filter((kinship) => {
        if (feminine) {
            return !masculineOnlyKinships.has(kinship);
        }

        return !feminineOnlyKinships.has(kinship);
    });
}

export function isKinshipAllowed(kinship: string, gender: string): kinship is Kinship {
    return isKinship(kinship) && kinshipOptionsForGender(gender).includes(kinship);
}

export function kinshipLabel(kinship: Kinship, gender: string): string {
    return isFeminineGender(gender)
        ? feminineKinshipLabels[kinship]
        : masculineKinshipLabels[kinship];
}

export const CPF_TAKEN_MESSAGE = "Este CPF já está em uso.";

export function cpfTakenMessage(cpf: string): string {
    return `${CPF_TAKEN_MESSAGE} ${cpf}`;
}

export function takenCpfDigits(message: string): string | null {
    if (!message.startsWith(CPF_TAKEN_MESSAGE)) {
        return null;
    }

    const digits = normalizeCpf(message.slice(CPF_TAKEN_MESSAGE.length));

    return digits.length === 11 ? digits : null;
}

export function ageInYears(date: Date): number {
    const today = new Date();
    let age = today.getUTCFullYear() - date.getUTCFullYear();
    const monthDelta = today.getUTCMonth() - date.getUTCMonth();

    if (monthDelta < 0 || (monthDelta === 0 && today.getUTCDate() < date.getUTCDate())) {
        age -= 1;
    }

    return Math.max(age, 0);
}

export function formatAge(date: Date): string {
    const age = ageInYears(date);

    return age === 1 ? "1 ano" : `${age} anos`;
}

export type FamilyMemberInput = {
    id: string;
    name: string;
    kinship: string;
    cpf: string;
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    email: string;
    contacts: string[];
    dateOfBirth: string;
    gender: string;
    maritalStatus: string;
    employment: string;
    profession: string;
    notes: string;
    status: string;
    aidType: string;
    expectedDeliveryDay: string;
    disability: string;
    rent: string;
};

export type BeneficiaryInput = {
    name: string;
    cpf: string;
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    email: string;
    contacts: string[];
    dateOfBirth: string;
    gender: string;
    maritalStatus: string;
    employment: string;
    profession: string;
    notes: string;
    status: string;
    aidType: string;
    expectedDeliveryDay: string;
    disability: string;
    rent: string;
    members: FamilyMemberInput[];
    assistantIds: string[];
};

export type UpdateBeneficiaryInput = BeneficiaryInput & {
    id: string;
};

export type FamilyMemberRecord = {
    id: string;
    name: string;
    kinship: Kinship;
    kinshipLabel: string;
    cpf: string;
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    email: string;
    contacts: string[];
    dateOfBirth: string;
    ageLabel: string;
    gender: string;
    maritalStatus: string;
    employment: string;
    profession: string;
    notes: string;
    status: string;
    aidType: string;
    expectedDeliveryDay: number | null;
    disability: string;
    rent: string;
};

export type BeneficiaryAssistantRecord = {
    id: string;
    name: string;
};

export type BeneficiaryOptionRecord = {
    id: string;
    name: string;
    cpf: string;
    ageLabel: string;
    neighborhood: string;
    city: string;
    state: string;
    status: BeneficiaryStatus;
};

export type AssistedBeneficiarySummary = {
    id: string;
    name: string;
    cpf: string;
    ageLabel: string;
    neighborhood: string;
    city: string;
    state: string;
    status: BeneficiaryStatus;
    membersCount: number;
};

export type BeneficiaryRecord = {
    id: string;
    name: string;
    cpf: string;
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    email: string;
    contacts: string[];
    dateOfBirth: string;
    ageLabel: string;
    gender: BeneficiaryGender;
    maritalStatus: MaritalStatus;
    employment: Employment;
    profession: string;
    notes: string;
    status: BeneficiaryStatus;
    aidType: AidType;
    expectedDeliveryDay: number | null;
    disability: DisabilityOption;
    rent: RentOption;
    members: FamilyMemberRecord[];
    assistants: BeneficiaryAssistantRecord[];
};
