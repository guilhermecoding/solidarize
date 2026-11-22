import { Home04Icon, ServiceIcon, ShoppingBasket03Icon, UserMultiple02Icon } from "@hugeicons/core-free-icons";
import { IconSvgElement } from "@hugeicons/react";

export type NavManagementItem = {
    name: string;
    url: string;
    icon: IconSvgElement;
    requiresReadAccess?: boolean;
};

export const navPrimary: NavManagementItem[] = [
    {
        name: "Início",
        url: "/",
        icon: Home04Icon,
        requiresReadAccess: false,
    },
];

export const navManagement: NavManagementItem[] = [
    {
        name: "Beneficiários",
        url: "/beneficiarios",
        icon: ServiceIcon,
        requiresReadAccess: true,
    },
    {
        name: "Cestas e Alimentos",
        url: "/cestas",
        icon: ShoppingBasket03Icon,
        requiresReadAccess: true,
    },
    {
        name: "Membros (Assistentes)",
        url: "/membros",
        icon: UserMultiple02Icon,
        requiresReadAccess: true,
    }

];
