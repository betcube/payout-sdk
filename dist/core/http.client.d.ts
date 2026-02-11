import type { PayoutModuleOptions } from '../interfaces/payout-module-options.interface';
import { type XmlResponse } from './xml.parser';
export declare class PayoutHttpClient {
    private readonly options;
    private readonly baseUrl;
    private readonly timeout;
    constructor(options: PayoutModuleOptions);
    postXml(xmlBody: string): Promise<XmlResponse>;
}
//# sourceMappingURL=http.client.d.ts.map