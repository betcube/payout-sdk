"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayoutHttpClient = void 0;
const common_1 = require("@nestjs/common");
const payout_constants_1 = require("../payout.constants");
const signature_1 = require("./signature");
const xml_parser_1 = require("./xml.parser");
const payout_errors_1 = require("../errors/payout.errors");
let PayoutHttpClient = class PayoutHttpClient {
    options;
    baseUrl;
    timeout;
    constructor(options) {
        this.options = options;
        if (options.baseUrl) {
            this.baseUrl = options.baseUrl.replace(/\/$/, '');
        }
        else {
            this.baseUrl = options.sandbox ? payout_constants_1.SANDBOX_URL : payout_constants_1.PRODUCTION_URL;
        }
        this.timeout = options.timeout ?? 30_000;
    }
    async postXml(xmlBody) {
        const url = this.baseUrl;
        const cleanXml = xmlBody.replace(/[\n\t]/g, '');
        const algorithm = this.options.hashAlgorithm ?? 'sha256';
        const signature = (0, signature_1.signXml)(cleanXml, this.options.privateKey, algorithm);
        const headers = {
            'Content-Type': 'text/xml',
            'Amega-Sign': signature,
            'Amega-Hash-Alg': algorithm,
            'Amega-UserId': this.options.pointId,
            'Amega-ProtocolVersion': '1',
        };
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: cleanXml,
                signal: controller.signal,
            });
            if (!response.ok) {
                const text = await response.text();
                throw new payout_errors_1.PayoutApiError(`HTTP ${response.status}: ${text}`, response.status, text);
            }
            const responseText = await response.text();
            const parsed = (0, xml_parser_1.parseXmlResponse)(responseText);
            if (parsed.resultCode !== 0) {
                throw new payout_errors_1.PayoutApiError(parsed.message ?? `API error code: ${parsed.resultCode}`, response.status, responseText, parsed.resultCode);
            }
            return parsed;
        }
        catch (error) {
            if (error instanceof payout_errors_1.PayoutApiError)
                throw error;
            throw new payout_errors_1.PayoutNetworkError(`Network error calling ${url}: ${error.message}`, error);
        }
        finally {
            clearTimeout(timeoutId);
        }
    }
};
exports.PayoutHttpClient = PayoutHttpClient;
exports.PayoutHttpClient = PayoutHttpClient = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(payout_constants_1.PAYOUT_MODULE_OPTIONS)),
    __metadata("design:paramtypes", [Object])
], PayoutHttpClient);
//# sourceMappingURL=http.client.js.map