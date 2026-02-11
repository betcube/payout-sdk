import type { BalanceEntry } from '../interfaces/balance.interface';
import type { Provider } from '../interfaces/provider.interface';
import type { PrecheckCoupon } from '../interfaces/precheck.interface';
export interface XmlElement {
    tag: string;
    attributes: Record<string, string>;
    children: XmlElement[];
    text: string;
}
/**
 * Minimal XML parser for the subset used by Payout API responses.
 * Handles: elements with attributes, self-closing tags, text content, nesting.
 * Does NOT handle: namespaces, CDATA, comments, processing instructions.
 */
export declare function parseXml(xml: string): XmlElement;
export interface XmlResponse {
    responseId: string;
    resultCode: number;
    message?: string;
    actionElement?: XmlElement;
}
export declare function parseXmlResponse(xml: string): XmlResponse;
export declare function parseBalanceResponse(action: XmlElement): BalanceEntry[];
export declare function parseProvidersResponse(action: XmlElement): Provider[];
export declare function parsePaymentResponse(action: XmlElement): {
    paymentId?: string;
    result: number;
    status?: number;
    state?: number;
    uid?: string;
    message?: string;
};
export declare function parsePrecheckResponse(action: XmlElement): {
    country?: string;
    operator?: string;
    couponList: PrecheckCoupon[];
};
//# sourceMappingURL=xml.parser.d.ts.map