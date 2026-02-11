"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayoutService = void 0;
const common_1 = require("@nestjs/common");
const http_client_1 = require("./core/http.client");
const xml = __importStar(require("./core/xml.builder"));
const parser = __importStar(require("./core/xml.parser"));
const payout_errors_1 = require("./errors/payout.errors");
let PayoutService = class PayoutService {
    http;
    constructor(http) {
        this.http = http;
    }
    async getBalance(req) {
        const xmlBody = xml.buildGetBalanceXml(req?.currency);
        const response = await this.http.postXml(xmlBody);
        const balances = parser.parseBalanceResponse(response.actionElement);
        return { balances };
    }
    async getProviders() {
        const xmlBody = xml.buildGetProvidersXml();
        const response = await this.http.postXml(xmlBody);
        return parser.parseProvidersResponse(response.actionElement);
    }
    async verifyPayment(req) {
        const xmlBody = xml.buildVerifyPaymentXml({
            paymentId: req.paymentId,
            serviceId: req.serviceId,
            fields: req.fields,
            amount: req.amount,
            currency: req.currency,
        });
        const response = await this.http.postXml(xmlBody);
        const payment = parser.parsePaymentResponse(response.actionElement);
        return {
            paymentId: payment.paymentId,
            result: payment.result,
            state: payment.state,
            message: payment.message,
        };
    }
    async createPayment(req) {
        const xmlBody = xml.buildCreatePaymentXml({
            paymentId: req.paymentId,
            serviceId: req.serviceId,
            fields: req.fields,
            amount: req.amount,
            dateTime: req.dateTime,
            comment: req.comment,
            currency: req.currency,
        });
        const response = await this.http.postXml(xmlBody);
        const payment = parser.parsePaymentResponse(response.actionElement);
        if (payment.result !== 0 && payment.status === 2) {
            throw new payout_errors_1.PayoutApiError(payment.message ?? `Payment error code: ${payment.result}`, 200, undefined, payment.result);
        }
        return {
            paymentId: payment.paymentId,
            result: payment.result,
            status: (payment.status ?? 0),
            uid: payment.uid,
            message: payment.message,
        };
    }
    async getPaymentStatus(req) {
        const xmlBody = xml.buildGetPaymentStatusXml(req.uid);
        const response = await this.http.postXml(xmlBody);
        const payment = parser.parsePaymentResponse(response.actionElement);
        return {
            uid: req.uid,
            result: payment.result,
            status: (payment.status ?? 0),
            message: payment.message,
        };
    }
    async getPrecheckStatus(req) {
        const xmlBody = xml.buildGetPrecheckStatusXml(req.serviceId, req.phone);
        const response = await this.http.postXml(xmlBody);
        return parser.parsePrecheckResponse(response.actionElement);
    }
};
exports.PayoutService = PayoutService;
exports.PayoutService = PayoutService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [http_client_1.PayoutHttpClient])
], PayoutService);
//# sourceMappingURL=payout.service.js.map