import { Home04Icon, ServiceIcon, ShoppingBasket03Icon, UsersRoundIcon } from "@hugeicons/core-free-icons";
import { IconSvgElement } from "@hugeicons/react";

export type NavManagementItem = {
    name: string;
    url: string;
    icon: IconSvgElement;
};

export const navManagement: NavManagementItem[] = [
    {
        name: "Início",
        url: "/inicio",
        icon: Home04Icon,
    },
    {
        name: "Beneficiários",
        url: "/beneficiarios",
        icon: ServiceIcon,
    },
    {
        name: "Membros",
        url: "/membros",
        icon: UsersRoundIcon,
    },
    {
        name: "Cestas e Alimentos",
        url: "/cestas",
        icon: ShoppingBasket03Icon,
    }

];
