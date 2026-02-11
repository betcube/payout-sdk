"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayoutErrorCode = exports.VerifyState = exports.PayoutResult = exports.PayoutPaymentStatus = exports.PayoutCurrency = void 0;
exports.PayoutCurrency = {
    RUR: 643,
    USD: 840,
    EUR: 978,
    ALL: 'ALL',
};
exports.PayoutPaymentStatus = {
    PROCESSING: 0,
    SUCCESS: 1,
    FAILED: 2,
};
exports.PayoutResult = {
    OK: 0,
    CHECKING: 1,
    ERROR: 2,
};
exports.VerifyState = {
    FINAL: 0,
    NOT_FINAL: 1,
};
exports.PayoutErrorCode = {
    OK: 0,
    INVALID_PHONE: 2,
    OPERATION_EXPIRED: 3,
    SERVICE_NOT_FOUND: 4,
    INSUFFICIENT_FUNDS: 5,
    PROVIDER_UNAVAILABLE: 7,
    PAYMENT_PROCESSING: 8,
    PAYMENT_OUT_OF_RANGE: 11,
    PROVIDER_COMM_ERROR: 12,
    PAYMENT_REJECTED_PROVIDER: 14,
    PAYMENT_REJECTED_SYSTEM: 15,
    SYSTEM_ERROR: 99,
    INVALID_REQUEST_FORMAT: 100,
    INVALID_AGENT_SIGNATURE: 101,
    USER_NOT_FOUND: 102,
    AGENT_NOT_FOUND: 103,
    SIGNATURE_VERIFICATION_FAILED: 107,
    COMMAND_NOT_FOUND: 111,
    PAYMENT_ALREADY_EXISTS: 115,
    PAYMENT_NOT_FOUND: 116,
    INSUFFICIENT_BALANCE: 117,
    INVALID_EMAIL: 118,
    INVALID_CURRENCY: 121,
    INVALID_DATE_FORMAT: 123,
    DAILY_LIMIT_EXCEEDED: 135,
};
//# sourceMappingURL=common.types.js.map