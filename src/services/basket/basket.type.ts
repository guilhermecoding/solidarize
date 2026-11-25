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
    deletedTemplateName: string | null;
    foodIds: string[];
    foods: BasketTemplateFoodItem[];
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

export type WithdrawBasketItemInput = {
    basketId: string;
    quantity: number;
};

export type WithdrawBasketsInput =
    | {
        items: WithdrawBasketItemInput[];
        recipientType: "listed";
        beneficiaryId: string;
        justification?: string;
    }
    | {
        items: WithdrawBasketItemInput[];
        recipientType: "unlisted";
        beneficiaryId?: string;
        justification: string;
    };

export type WithdrawAssistedBasketsInput = {
    beneficiaryId: string;
    items: WithdrawBasketItemInput[];
};

export type BeneficiaryDeliveryItemRecord = {
    id: string;
    quantity: number;
    basketName: string;
    templateLabel: string | null;
    createdByName: string;
    createdAtLabel: string;
    monthKey: string;
    monthLabel: string;
};

export type BeneficiaryDeliveryPage = {
    items: BeneficiaryDeliveryItemRecord[];
    total: number;
    page: number;
    pageCount: number;
};
