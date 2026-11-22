import {
    Apple01Icon,
    ArrowBigDownDashIcon,
    CirclePlusIcon,
    Clock01Icon,
    GridViewIcon,
    ListViewIcon,
    ShoppingBasket03Icon,
    ShoppingBasketCheckOut03Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

export type HubAction = "new-basket" | "withdraw-basket" | "new-food" | "withdraw-food";

type BaseModuleItem = {
    id: string;
    title: string;
    description: string;
    actionLabel: string;
    icon: IconSvgElement;
};

export type ModuleLinkItem = BaseModuleItem & {
    kind: "link";
    href: string;
};

export type ModuleActionItem = BaseModuleItem & {
    kind: "action";
    action: HubAction;
};

export type ModuleItem = ModuleLinkItem | ModuleActionItem;

export type ModuleGroup = {
    id: string;
    title: string;
    icon: IconSvgElement;
    columns: 3 | 4 | 5;
    items: ModuleItem[];
};

export const basketModules: ModuleGroup = {
    id: "cestas",
    title: "Cestas de Alimentação",
    icon: ShoppingBasket03Icon,
    columns: 5,
    items: [
        {
            id: "nova-cesta",
            kind: "action",
            title: "Novas Cestas",
            description: "Monte e registre uma nova cesta com base em itens avulsos ou modelos pré-definidos.",
            actionLabel: "Novo cadastro",
            action: "new-basket",
            icon: CirclePlusIcon,
        },
        {
            id: "listar-cestas",
            kind: "link",
            title: "Listar Cestas",
            description: "Visualize todas as cestas montadas e prontas para entrega.",
            actionLabel: "Acessar listagem",
            href: "/cestas/listar",
            icon: ListViewIcon,
        },
        {
            id: "modelos-cesta",
            kind: "link",
            title: "Modelos de Cesta",
            description: "Defina padrões pré-configurados de cestas.",
            actionLabel: "Gerenciar templates",
            href: "/cestas/modelos",
            icon: GridViewIcon,
        },
        {
            id: "retirar-cestas",
            kind: "action",
            title: "Retirar Cestas",
            description: "Registre a retirada de cestas em estoque e direcione para um beneficiário.",
            actionLabel: "Registrar retirada",
            action: "withdraw-basket",
            icon: ShoppingBasketCheckOut03Icon,
        },
        {
            id: "historico-cestas",
            kind: "link",
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
    columns: 4,
    items: [
        {
            id: "novo-alimento",
            kind: "action",
            title: "Novo Alimento",
            description: "Adicione novos itens ao estoque informando validade, peso e unidade.",
            actionLabel: "Cadastrar item",
            action: "new-food",
            icon: CirclePlusIcon,
        },
        {
            id: "listar-alimentos",
            kind: "link",
            title: "Listar Alimentos",
            description: "Gerencie o estoque em tempo real, quantidades disponíveis e validades.",
            actionLabel: "Ver inventário",
            href: "/cestas/alimentos/listar",
            icon: ListViewIcon,
        },
        {
            id: "retirar-alimentos",
            kind: "action",
            title: "Retirar Alimentos",
            description: "Registre a retirada de alimentos em estoque e direcione para um beneficiário.",
            actionLabel: "Registrar retirada",
            action: "withdraw-food",
            icon: ArrowBigDownDashIcon,
        },
        {
            id: "historico-alimentos",
            kind: "link",
            title: "Histórico",
            description: "Registro completo de entradas, perdas, descarte e transferências de itens.",
            actionLabel: "Consultar registros",
            href: "/cestas/alimentos/historico",
            icon: Clock01Icon,
        },
    ],
};
