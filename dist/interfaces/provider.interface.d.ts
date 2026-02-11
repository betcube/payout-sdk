export interface ProviderFieldValidator {
    regexp: string;
}
export interface ProviderFieldSelectItem {
    key: string;
    label: string;
}
export interface ProviderField {
    name: string;
    title: string;
    type: string;
    description?: string;
    validator?: ProviderFieldValidator;
    items?: ProviderFieldSelectItem[];
}
export interface CommissionRange {
    from: string;
    /** 0 = percentage, 1 = fixed */
    type: string;
    value: string;
}
export interface ProviderCommission {
    currency?: string;
    minAmount?: string;
    maxAmount?: string;
    ranges: CommissionRange[];
}
export interface ProviderTag {
    title: string;
}
export interface Provider {
    id: string;
    groupId?: string;
    fullName: string;
    shortName: string;
    minAmount?: string;
    maxAmount?: string;
    icon?: string;
    iconHires?: string;
    fields: ProviderField[];
    commissions: ProviderCommission[];
    tags: ProviderTag[];
}
export type GetProvidersResponse = Provider[];
//# sourceMappingURL=provider.interface.d.ts.map