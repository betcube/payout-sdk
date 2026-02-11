"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayoutXmlParseError = exports.PayoutNetworkError = exports.PayoutApiError = exports.PayoutError = void 0;
class PayoutError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PayoutError';
    }
}
exports.PayoutError = PayoutError;
class PayoutApiError extends PayoutError {
    httpStatus;
    responseBody;
    apiErrorCode;
    constructor(message, httpStatus, responseBody, apiErrorCode) {
        super(message);
        this.httpStatus = httpStatus;
        this.responseBody = responseBody;
        this.apiErrorCode = apiErrorCode;
        this.name = 'PayoutApiError';
    }
}
exports.PayoutApiError = PayoutApiError;
class PayoutNetworkError extends PayoutError {
    cause;
    constructor(message, cause) {
        super(message);
        this.cause = cause;
        this.name = 'PayoutNetworkError';
    }
}
exports.PayoutNetworkError = PayoutNetworkError;
class PayoutXmlParseError extends PayoutError {
    rawXml;
    constructor(message, rawXml) {
        super(message);
        this.rawXml = rawXml;
        this.name = 'PayoutXmlParseError';
    }
}
exports.PayoutXmlParseError = PayoutXmlParseError;
//# sourceMappingURL=payout.errors.js.map