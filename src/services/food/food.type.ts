import { BananaIcon, BeanIcon, BiscuitIcon, Coffee02Icon, HamIcon, IceCubesIcon, LeafyGreenIcon, MilkCartonIcon, MilkIcon, NoodlesIcon, PopcornIcon, RainDropIcon, RiceBowl01Icon, WeightScale01Icon, WheatIcon } from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import type { ExpiryStatus } from "@/lib/date-br";

export const foodTypes = [
    "arroz",
    "feijao",
    "massas",
    "farinhas",
    "frutas",
    "verduras_e_legumes",
    "carnes_e_ovos",
    "leites_e_derivados",
    "acucar",
    "oleo",
    "sal",
    "cafe",
    "biscoitos",
    "temperos",
    "bebidas",
] as const;

export type FoodType = (typeof foodTypes)[number];

export const foodTypeLabels: Record<FoodType, string> = {
    arroz: "Arroz",
    feijao: "Feijão",
    massas: "Massas",
    farinhas: "Farinhas",
    frutas: "Frutas",
    verduras_e_legumes: "Verduras e Legumes",
    carnes_e_ovos: "Carnes e Ovos",
    leites_e_derivados: "Leites e Derivados",
    acucar: "Açúcar",
    oleo: "Óleo",
    sal: "Sal",
    cafe: "Café",
    biscoitos: "Biscoitos",
    temperos: "Temperos",
    bebidas: "Bebidas",
};

export const foodTypeIcons: Record<FoodType, IconSvgElement> = {
    arroz: RiceBowl01Icon,
    feijao: BeanIcon,
    massas: NoodlesIcon,
    farinhas: WheatIcon,
    frutas: BananaIcon,
    verduras_e_legumes: LeafyGreenIcon,
    carnes_e_ovos: HamIcon,
    leites_e_derivados: MilkCartonIcon,
    acucar: IceCubesIcon,
    oleo: RainDropIcon,
    sal: WeightScale01Icon,
    cafe: Coffee02Icon,
    biscoitos: BiscuitIcon,
    temperos: PopcornIcon,
    bebidas: MilkIcon,
};

/**
 * Verifica se uma string corresponde a um tipo de alimento válido.
 */
export function isFoodType(value: string): value is FoodType {
    return (foodTypes as readonly string[]).includes(value);
}

export type FoodListTab = "geral" | "vencendo";

export type InventoryActor = {
    id: string;
    name: string;
};

export type FoodOptionRecord = {
    id: string;
    label: string;
    type: FoodType;
    typeLabel: string;
    batch: string;
    quantity: number;
    expiresAtLabel: string | null;
    expiryStatus: ExpiryStatus;
};

export type FoodRecord = {
    id: string;
    label: string;
    type: FoodType;
    typeLabel: string;
    batch: string;
    brand: string;
    productCode: string;
    quantity: number;
    createdAtLabel: string;
    expiresAtLabel: string | null;
    expiryStatus: ExpiryStatus;
};

export type FoodListPage = {
    tab: FoodListTab;
    items: FoodRecord[];
    total: number;
    totalAll: number;
    totalExpiring: number;
    page: number;
    pageCount: number;
};

export type HistoryItemRecord = {
    id: string;
    type: "in" | "out" | "delete";
    title: string;
    subtitle: string;
    detail?: string | null;
    createdAtLabel: string;
    createdByName: string;
    dayKey: string;
    dayLabel: string;
};

export type HistoryPage = {
    items: HistoryItemRecord[];
    total: number;
    page: number;
    pageCount: number;
};

export type CreateFoodInput = {
    label: string;
    type: string;
    expiresAt: string;
    brand: string;
    quantity: number;
    productCode: string;
};

export type UpdateFoodInput = CreateFoodInput & {
    id: string;
};

export type WithdrawFoodItemInput = {
    foodId: string;
    quantity: number;
};

export type WithdrawFoodsInput =
    | {
        items: WithdrawFoodItemInput[];
        recipientType: "listed";
        beneficiaryId: string;
        justification?: string;
    }
    | {
        items: WithdrawFoodItemInput[];
        recipientType: "unlisted";
        beneficiaryId?: string;
        justification: string;
    };
