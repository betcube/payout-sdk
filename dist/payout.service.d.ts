import { PayoutHttpClient } from './core/http.client';
import type { GetBalanceRequest, GetBalanceResponse } from './interfaces/balance.interface';
import type { Provider } from './interfaces/provider.interface';
import type { VerifyPaymentRequest, VerifyPaymentResponse } from './interfaces/verify-payment.interface';
import type { CreatePaymentRequest, CreatePaymentResponse } from './interfaces/create-payment.interface';
import type { GetPaymentStatusRequest, GetPaymentStatusResponse } from './interfaces/payment-status.interface';
import type { GetPrecheckStatusRequest, GetPrecheckStatusResponse } from './interfaces/precheck.interface';
export declare class PayoutService {
    private readonly http;
    constructor(http: PayoutHttpClient);
    getBalance(req?: GetBalanceRequest): Promise<GetBalanceResponse>;
    getProviders(): Promise<Provider[]>;
    verifyPayment(req: VerifyPaymentRequest): Promise<VerifyPaymentResponse>;
    createPayment(req: CreatePaymentRequest): Promise<CreatePaymentResponse>;
    getPaymentStatus(req: GetPaymentStatusRequest): Promise<GetPaymentStatusResponse>;
    getPrecheckStatus(req: GetPrecheckStatusRequest): Promise<GetPrecheckStatusResponse>;
}
//# sourceMappingURL=payout.service.d.ts.map