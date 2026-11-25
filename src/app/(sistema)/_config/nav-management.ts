import {
    HealtcareIcon,
    Home04Icon,
    KanbanIcon,
    PieChartIcon,
    ServiceIcon,
    ShoppingBasket03Icon,
    ShoppingBasketCheckOut03Icon, UserMultiple02Icon
} from "@hugeicons/core-free-icons";

import type { NavSectionGroup, NavSectionItem } from "@/components/nav-management";

export type NavManagementItem = NavSectionItem;
export type NavSectionConfig = NavSectionGroup;

export const navPrimary: NavSectionGroup = {
    items: [
        {
            name: "Início",
            url: "/",
            icon: Home04Icon,
            requiresReadAccess: false,
        },
    ],
};

export const navManagement: NavSectionGroup[] = [
    {
        label: "GESTÃO",
        icon: KanbanIcon,
        mobileUrl: "/gestao",
        items: [
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
                name: "Indicadores",
                url: "/indicadores",
                icon: PieChartIcon,
                requiresReadAccess: true,
            },
            {
                name: "Membros",
                url: "/membros",
                icon: UserMultiple02Icon,
                requiresReadAccess: true,
            },
        ],
    },
    {
        label: "PARA VOCÊ",
        icon: HealtcareIcon,
        mobileUrl: "/para-voce",
        items: [
            {
                name: "Retirar Cesta",
                url: "/retirar-cesta",
                icon: ShoppingBasketCheckOut03Icon,
                requiresReadAccess: false,
            },
            {
                name: "Minhas Famílias",
                url: "/minhas-familias",
                icon: HealtcareIcon,
                requiresReadAccess: false,
            },
        ],
    }
];
