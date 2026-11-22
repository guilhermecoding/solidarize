import { Home04Icon, ServiceIcon, ShoppingBasket03Icon, UserMultiple02Icon } from "@hugeicons/core-free-icons";
import { IconSvgElement } from "@hugeicons/react";

export type NavManagementItem = {
    name: string;
    url: string;
    icon: IconSvgElement;
    requiresReadAccess?: boolean;
};

export const navManagement: NavManagementItem[] = [
    {
        name: "Início",
        url: "/",
        icon: Home04Icon,
        requiresReadAccess: false,
    },
    {
        name: "Beneficiários",
        url: "/beneficiarios",
        icon: ServiceIcon,
        requiresReadAccess: true,
    },
    {
        name: "Membros",
        url: "/membros",
        icon: UserMultiple02Icon,
        requiresReadAccess: true,
    },
    {
        name: "Cestas e Alimentos",
        url: "/cestas",
        icon: ShoppingBasket03Icon,
        requiresReadAccess: true,
    },

];
