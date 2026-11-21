import {
    Apple01Icon, CirclePlusIcon, Clock01Icon, GridViewIcon, ListViewIcon,
    ShoppingBasket03Icon
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

export type ModuleItem = {
    id: string;
    title: string;
    description: string;
    actionLabel: string;
    href: string;
    icon: IconSvgElement;
};

export type ModuleGroup = {
    id: string;
    title: string;
    icon: IconSvgElement;
    columns: 3 | 4;
    items: ModuleItem[];
};

export const basketModules: ModuleGroup = {
    id: "cestas",
    title: "Cestas de Alimentação",
    icon: ShoppingBasket03Icon,
    columns: 4,
    items: [
        {
            id: "nova-cesta",
            title: "Nova Cesta",
            description: "Monte e registre uma nova cesta com base em itens avulsos ou modelos pré-definidos.",
            actionLabel: "Novo cadastro",
            href: "/cestas/nova",
            icon: CirclePlusIcon,
        },
        {
            id: "listar-cestas",
            title: "Listar Cestas",
            description: "Visualize todas as cestas montadas e prontas para entrega.",
            actionLabel: "Acessar listagem",
            href: "/cestas/listar",
            icon: ListViewIcon,
        },
        {
            id: "modelos-cesta",
            title: "Modelos de Cesta",
            description: "Defina padrões pré-configurados de cestas.",
            actionLabel: "Gerenciar templates",
            href: "/cestas/modelos",
            icon: GridViewIcon,
        },
        {
            id: "historico-cestas",
            title: "Histórico",
            description: "Consulte saídas, doações e entregas já realizadas pela entidade.",
            actionLabel: "Ver histórico",
            href: "/cestas/historico",
            icon: Clock01Icon,
        },
    ],
};

export const foodModules: ModuleGroup = {
    id: "alimentos",
    title: "Alimentos",
    icon: Apple01Icon,
    columns: 3,
    items: [
        {
            id: "novo-alimento",
            title: "Novo Alimento",
            description: "Adicione novos itens ao estoque informando validade, peso e unidade.",
            actionLabel: "Cadastrar item",
            href: "/cestas/alimentos/novo",
            icon: CirclePlusIcon,
        },
        {
            id: "listar-alimentos",
            title: "Listar Alimentos",
            description: "Gerencie o estoque em tempo real, quantidades disponíveis e validades.",
            actionLabel: "Ver inventário",
            href: "/cestas/alimentos",
            icon: ListViewIcon,
        },
        {
            id: "historico-alimentos",
            title: "Histórico",
            description: "Registro completo de entradas, perdas, descarte e transferências de itens.",
            actionLabel: "Consultar registros",
            href: "/cestas/alimentos/historico",
            icon: Clock01Icon,
        },
    ],
};
