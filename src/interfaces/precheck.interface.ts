export interface GetPrecheckStatusRequest {
  serviceId: number;
  phone: string;
}

export interface PrecheckCoupon {
  cost: string;
  charge: string;
  value: string;
}

export interface GetPrecheckStatusResponse {
  country?: string;
  operator?: string;
  couponList: PrecheckCoupon[];
}
