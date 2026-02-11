export type HashAlgorithm = 'md5' | 'sha1' | 'sha256';
export declare const PayoutCurrency: {
    readonly RUR: 643;
    readonly USD: 840;
    readonly EUR: 978;
    readonly ALL: "ALL";
};
export type PayoutCurrency = (typeof PayoutCurrency)[keyof typeof PayoutCurrency];
export declare const PayoutPaymentStatus: {
    readonly PROCESSING: 0;
    readonly SUCCESS: 1;
    readonly FAILED: 2;
};
export type PayoutPaymentStatus = (typeof PayoutPaymentStatus)[keyof typeof PayoutPaymentStatus];
export declare const PayoutResult: {
    readonly OK: 0;
    readonly CHECKING: 1;
    readonly ERROR: 2;
};
export type PayoutResult = (typeof PayoutResult)[keyof typeof PayoutResult];
export declare const VerifyState: {
    readonly FINAL: 0;
    readonly NOT_FINAL: 1;
};
export type VerifyState = (typeof VerifyState)[keyof typeof VerifyState];
export declare const PayoutErrorCode: {
    readonly OK: 0;
    readonly INVALID_PHONE: 2;
    readonly OPERATION_EXPIRED: 3;
    readonly SERVICE_NOT_FOUND: 4;
    readonly INSUFFICIENT_FUNDS: 5;
    readonly PROVIDER_UNAVAILABLE: 7;
    readonly PAYMENT_PROCESSING: 8;
    readonly PAYMENT_OUT_OF_RANGE: 11;
    readonly PROVIDER_COMM_ERROR: 12;
    readonly PAYMENT_REJECTED_PROVIDER: 14;
    readonly PAYMENT_REJECTED_SYSTEM: 15;
    readonly SYSTEM_ERROR: 99;
    readonly INVALID_REQUEST_FORMAT: 100;
    readonly INVALID_AGENT_SIGNATURE: 101;
    readonly USER_NOT_FOUND: 102;
    readonly AGENT_NOT_FOUND: 103;
    readonly SIGNATURE_VERIFICATION_FAILED: 107;
    readonly COMMAND_NOT_FOUND: 111;
    readonly PAYMENT_ALREADY_EXISTS: 115;
    readonly PAYMENT_NOT_FOUND: 116;
    readonly INSUFFICIENT_BALANCE: 117;
    readonly INVALID_EMAIL: 118;
    readonly INVALID_CURRENCY: 121;
    readonly INVALID_DATE_FORMAT: 123;
    readonly DAILY_LIMIT_EXCEEDED: 135;
};
export type PayoutErrorCode = (typeof PayoutErrorCode)[keyof typeof PayoutErrorCode];
//# sourceMappingURL=common.types.d.ts.map