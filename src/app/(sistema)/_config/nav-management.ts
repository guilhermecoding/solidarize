import {
    DashboardSquare02Icon,
    HealtcareIcon,
    Home04Icon,
    PieChartIcon,
    ServiceIcon,
    ShoppingBasket03Icon,
    ShoppingBasketFavorite03Icon,
    UserAccountIcon,
    UserMultiple02Icon,
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
        icon: DashboardSquare02Icon,
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
        label: "MEMBRO",
        icon: UserAccountIcon,
        mobileUrl: "/membro",
        items: [
            {
                name: "Minhas Famílias",
                url: "/familias",
                icon: HealtcareIcon,
                requiresReadAccess: true,
            },
            {
                name: "Cestas de Alimentação",
                url: "/cestas-alimentacao",
                icon: ShoppingBasketFavorite03Icon,
                requiresReadAccess: true,
            },
        ],
    }
];
