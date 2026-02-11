export declare class PayoutError extends Error {
    constructor(message: string);
}
export declare class PayoutApiError extends PayoutError {
    readonly httpStatus: number;
    readonly responseBody?: string | undefined;
    readonly apiErrorCode?: number | undefined;
    constructor(message: string, httpStatus: number, responseBody?: string | undefined, apiErrorCode?: number | undefined);
}
export declare class PayoutNetworkError extends PayoutError {
    readonly cause?: Error | undefined;
    constructor(message: string, cause?: Error | undefined);
}
export declare class PayoutXmlParseError extends PayoutError {
    readonly rawXml?: string | undefined;
    constructor(message: string, rawXml?: string | undefined);
}
//# sourceMappingURL=payout.errors.d.ts.map