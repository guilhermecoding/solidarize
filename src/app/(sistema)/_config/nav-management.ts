import { UsersRoundIcon } from "@hugeicons/core-free-icons";
import { IconSvgElement } from "@hugeicons/react";

export type NavManagementItem = {
    name: string;
    url: string;
    icon: IconSvgElement;
};

export const navManagement: NavManagementItem[] = [
    {
        name: "Membros",
        url: "/membros",
        icon: UsersRoundIcon
    },
];