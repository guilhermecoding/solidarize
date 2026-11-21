export type BasketTemplateFoodItem = {
    id: string;
    label: string;
    typeLabel: string;
    batch: string;
};

export type BasketTemplateRecord = {
    id: string;
    name: string;
    foodIds: string[];
    foods: BasketTemplateFoodItem[];
    foodCount: number;
    createdByName: string;
    createdAtLabel: string;
    createdAtDateLabel: string;
};

export type BasketRecord = {
    id: string;
    name: string;
    quantity: number;
    templateId: string | null;
    templateName: string | null;
    foodIds: string[];
    foodCount: number;
    createdByName: string;
    createdAtLabel: string;
    createdAtDateLabel: string;
};

export type CreateBasketTemplateInput = {
    name: string;
    foodIds: string[];
};

export type UpdateBasketTemplateInput = {
    id: string;
    name: string;
    foodIds: string[];
};

export type CreateBasketInput = {
    templateId: string;
    quantity: number;
    foodIds: string[];
};

export type UpdateBasketInput = {
    id: string;
    templateId: string;
    quantity: number;
    foodIds: string[];
};
