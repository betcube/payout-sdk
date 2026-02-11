import type { PayoutPaymentStatus } from './common.types';
export interface CreatePaymentRequest {
    paymentId: string | number;
    serviceId: number;
    fields: Record<string, string>;
    amount: number;
    /** Format: "YYYY-MM-dd HH:mm:ss" */
    dateTime: string;
    comment: string;
    currency?: number;
}
export interface CreatePaymentResponse {
    paymentId?: string;
    result: number;
    status: PayoutPaymentStatus;
    /** System payment UID (e.g. "006064-000091") */
    uid?: string;
    message?: string;
}
//# sourceMappingURL=create-payment.interface.d.ts.map