import { CropIcon, PieChartIcon, MapsIcon } from "@hugeicons/core-free-icons";
import { IconSvgElement } from "@hugeicons/react";

export type NavManagementItem = {
    name: string;
    url: string;
    icon: IconSvgElement;
};

export const navManagement: NavManagementItem[] = [
    {
        name: "Design Engineering",
        url: "#",
        icon: CropIcon
    },
    {
        name: "Sales & Marketing",
        url: "#",
        icon: PieChartIcon
    },
    {
        name: "Travel",
        url: "#",
        icon: MapsIcon
    },
];