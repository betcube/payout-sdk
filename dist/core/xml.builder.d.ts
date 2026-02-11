export declare function buildGetBalanceXml(currency?: number | string): string;
export declare function buildGetProvidersXml(): string;
export declare function buildVerifyPaymentXml(params: {
    paymentId: string | number;
    serviceId: number;
    fields: Record<string, string>;
    amount: number;
    currency?: number;
}): string;
export declare function buildCreatePaymentXml(params: {
    paymentId: string | number;
    serviceId: number;
    fields: Record<string, string>;
    amount: number;
    dateTime: string;
    comment: string;
    currency?: number;
}): string;
export declare function buildGetPaymentStatusXml(uid: string): string;
export declare function buildGetPrecheckStatusXml(serviceId: number, phone: string): string;
//# sourceMappingURL=xml.builder.d.ts.map