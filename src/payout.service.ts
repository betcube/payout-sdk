import { Injectable } from '@nestjs/common';
import { PayoutHttpClient } from './core/http.client';
import * as xml from './core/xml.builder';
import * as parser from './core/xml.parser';
import { PayoutApiError } from './errors/payout.errors';
import type {
  GetBalanceRequest,
  GetBalanceResponse,
} from './interfaces/balance.interface';
import type { Provider } from './interfaces/provider.interface';
import type {
  VerifyPaymentRequest,
  VerifyPaymentResponse,
} from './interfaces/verify-payment.interface';
import type {
  CreatePaymentRequest,
  CreatePaymentResponse,
} from './interfaces/create-payment.interface';
import type {
  GetPaymentStatusRequest,
  GetPaymentStatusResponse,
} from './interfaces/payment-status.interface';
import type {
  GetPrecheckStatusRequest,
  GetPrecheckStatusResponse,
} from './interfaces/precheck.interface';
import type { PayoutResult } from './interfaces/common.types';
import type { PayoutPaymentStatus } from './interfaces/common.types';

@Injectable()
export class PayoutService {
  constructor(private readonly http: PayoutHttpClient) {}

  async getBalance(req?: GetBalanceRequest): Promise<GetBalanceResponse> {
    const xmlBody = xml.buildGetBalanceXml(req?.currency);
    const response = await this.http.postXml(xmlBody);
    const balances = parser.parseBalanceResponse(response.actionElement!);
    return { balances };
  }

  async getProviders(): Promise<Provider[]> {
    const xmlBody = xml.buildGetProvidersXml();
    const response = await this.http.postXml(xmlBody);
    return parser.parseProvidersResponse(response.actionElement!);
  }

  async verifyPayment(
    req: VerifyPaymentRequest,
  ): Promise<VerifyPaymentResponse> {
    const xmlBody = xml.buildVerifyPaymentXml({
      paymentId: req.paymentId,
      serviceId: req.serviceId,
      fields: req.fields,
      amount: req.amount,
      currency: req.currency,
    });
    const response = await this.http.postXml(xmlBody);
    const payment = parser.parsePaymentResponse(response.actionElement!);

    return {
      paymentId: payment.paymentId,
      result: payment.result as PayoutResult,
      state: payment.state as 0 | 1 | undefined,
      message: payment.message,
    };
  }

  async createPayment(
    req: CreatePaymentRequest,
  ): Promise<CreatePaymentResponse> {
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
    const payment = parser.parsePaymentResponse(response.actionElement!);

    if (payment.result !== 0 && payment.status === 2) {
      throw new PayoutApiError(
        payment.message ?? `Payment error code: ${payment.result}`,
        200,
        undefined,
        payment.result,
      );
    }

    return {
      paymentId: payment.paymentId,
      result: payment.result,
      status: (payment.status ?? 0) as PayoutPaymentStatus,
      uid: payment.uid,
      message: payment.message,
    };
  }

  async getPaymentStatus(
    req: GetPaymentStatusRequest,
  ): Promise<GetPaymentStatusResponse> {
    const xmlBody = xml.buildGetPaymentStatusXml(req.uid);
    const response = await this.http.postXml(xmlBody);
    const payment = parser.parsePaymentResponse(response.actionElement!);

    return {
      uid: req.uid,
      result: payment.result,
      status: (payment.status ?? 0) as PayoutPaymentStatus,
      message: payment.message,
    };
  }

  async getPrecheckStatus(
    req: GetPrecheckStatusRequest,
  ): Promise<GetPrecheckStatusResponse> {
    const xmlBody = xml.buildGetPrecheckStatusXml(req.serviceId, req.phone);
    const response = await this.http.postXml(xmlBody);
    return parser.parsePrecheckResponse(response.actionElement!);
  }
}
