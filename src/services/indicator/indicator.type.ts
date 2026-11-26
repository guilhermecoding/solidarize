export type AidTypeIndicator = {
    key: string;
    label: string;
    count: number;
    percentage: number;
};

export type ActiveCharacteristicKey =
    | "children"
    | "elderly"
    | "pcd"
    | "rent"
    | "unemployed";

export type ActiveCharacteristicIndicator = {
    key: ActiveCharacteristicKey;
    label: string;
    count: number;
    percentage: number;
};

export type NeighborhoodIndicator = {
    label: string;
    count: number;
    percentage: number;
};

export type AgeGroupIndicator = {
    key: string;
    label: string;
    count: number;
};

export type ExpectedDeliveryDayPoint = {
    day: number;
    label: string;
    count: number;
};

export type ExpectedDeliveryWeekPoint = {
    key: string;
    label: string;
    count: number;
};

export type AssistantWorkloadIndicator = {
    id: string;
    name: string;
    familiesCount: number;
};

export type BeneficiaryIndicators = {
    totalBeneficiaries: number;
    approvedCount: number;
    rejectedCount: number;
    approvedFamilyMembersCount: number;
    totalAssistedPeople: number;
    approvedWithoutAssistantCount: number;
    membersWithoutBirthDateCount: number;
    aidTypes: AidTypeIndicator[];
    activeCharacteristics: ActiveCharacteristicIndicator[];
    byNeighborhood: NeighborhoodIndicator[];
    ageGroups: AgeGroupIndicator[];
    expectedDeliveryDays: {
        byDay: ExpectedDeliveryDayPoint[];
        byWeek: ExpectedDeliveryWeekPoint[];
        unscheduledCount: number;
    };
    assistantWorkload: AssistantWorkloadIndicator[];
};

export type FoodStockByTypeIndicator = {
    key: string;
    label: string;
    quantity: number;
    lots: number;
};

export type ExpiryHealthBucketKey =
    | "expired"
    | "expiring_7d"
    | "expiring_30d"
    | "ok"
    | "none";

export type ExpiryHealthIndicator = {
    key: ExpiryHealthBucketKey;
    label: string;
    lots: number;
    units: number;
};

export type BasketByTemplateIndicator = {
    label: string;
    quantity: number;
};

export type UrgentExpiringFoodIndicator = {
    id: string;
    label: string;
    batch: string;
    quantity: number;
    expiresAtLabel: string;
    expiryStatus: "expired" | "expiring";
};

export type InventoryIndicators = {
    totalReadyBaskets: number;
    totalFoodUnits: number;
    totalFoodLots: number;
    expiredFoodLots: number;
    expiringSoonFoodLots: number;
    expiringMonthFoodLots: number;
    zeroStockFoodCategoriesCount: number;
    foodStockByType: FoodStockByTypeIndicator[];
    expiryHealth: ExpiryHealthIndicator[];
    basketsByTemplate: BasketByTemplateIndicator[];
    urgentExpiringFoods: UrgentExpiringFoodIndicator[];
};

export type MonthlyDeliverySeriesPoint = {
    monthKey: string;
    monthLabel: string;
    basketsOut: number;
    basketsIn: number;
    foodsOut: number;
    foodsIn: number;
};

export type CurrentMonthProgressIndicator = {
    deliveredFamilies: number;
    overdueFamilies: number;
    upcomingFamilies: number;
    unscheduledPendingFamilies: number;
    totalApprovedFamilies: number;
};

export type TopMemberDeliveryIndicator = {
    name: string;
    deliveriesCount: number;
    basketsQuantity: number;
};

export type DeliveryFlowIndicators = {
    currentMonthLabel: string;
    currentDayOfMonth: number;
    currentMonthBasketsDelivered: number;
    previousMonthBasketsDelivered: number;
    currentMonthFoodUnitsDelivered: number;
    currentMonthDeliveriesCount: number;
    monthlySeries: MonthlyDeliverySeriesPoint[];
    currentMonthProgress: CurrentMonthProgressIndicator;
    recipientBreakdown: {
        listedCount: number;
        unlistedCount: number;
        totalCount: number;
    };
    topMembersCurrentMonth: TopMemberDeliveryIndicator[];
};

export type IndicatorsSnapshot = {
    currentMonthLabel: string;
    currentDayOfMonth: number;
    beneficiaries: BeneficiaryIndicators;
    inventory: InventoryIndicators;
    deliveries: DeliveryFlowIndicators;
};
