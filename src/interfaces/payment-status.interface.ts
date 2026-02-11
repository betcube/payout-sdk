import type { PayoutPaymentStatus } from './common.types';

export interface GetPaymentStatusRequest {
  /** System UID from createPayment response */
  uid: string;
}

export interface GetPaymentStatusResponse {
  uid: string;
  result: number;
  status: PayoutPaymentStatus;
  message?: string;
}
