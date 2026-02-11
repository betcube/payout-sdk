import type { PayoutResult, VerifyState } from './common.types';

export interface VerifyPaymentRequest {
  paymentId: string | number;
  serviceId: number;
  fields: Record<string, string>;
  amount: number;
  currency?: number;
}

export interface VerifyPaymentResponse {
  paymentId?: string;
  result: PayoutResult;
  state?: VerifyState;
  message?: string;
}
