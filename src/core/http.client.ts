import { Injectable, Inject } from '@nestjs/common';
import type { PayoutModuleOptions } from '../interfaces/payout-module-options.interface';
import {
  PAYOUT_MODULE_OPTIONS,
  PRODUCTION_URL,
  SANDBOX_URL,
} from '../payout.constants';
import { signXml } from './signature';
import { parseXmlResponse, type XmlResponse } from './xml.parser';
import { PayoutApiError, PayoutNetworkError } from '../errors/payout.errors';

@Injectable()
export class PayoutHttpClient {
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(
    @Inject(PAYOUT_MODULE_OPTIONS) private readonly options: PayoutModuleOptions,
  ) {
    if (options.baseUrl) {
      this.baseUrl = options.baseUrl.replace(/\/$/, '');
    } else {
      this.baseUrl = options.sandbox ? SANDBOX_URL : PRODUCTION_URL;
    }
    this.timeout = options.timeout ?? 30_000;
  }

  async postXml(xmlBody: string): Promise<XmlResponse> {
    const url = this.baseUrl;
    const cleanXml = xmlBody.replace(/[\n\t]/g, '');

    const algorithm = this.options.hashAlgorithm ?? 'sha256';
    const signature = signXml(cleanXml, this.options.privateKey, algorithm);

    const headers: Record<string, string> = {
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
        throw new PayoutApiError(
          `HTTP ${response.status}: ${text}`,
          response.status,
          text,
        );
      }

      const responseText = await response.text();
      const parsed = parseXmlResponse(responseText);

      if (parsed.resultCode !== 0) {
        throw new PayoutApiError(
          parsed.message ?? `API error code: ${parsed.resultCode}`,
          response.status,
          responseText,
          parsed.resultCode,
        );
      }

      return parsed;
    } catch (error) {
      if (error instanceof PayoutApiError) throw error;
      throw new PayoutNetworkError(
        `Network error calling ${url}: ${(error as Error).message}`,
        error as Error,
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
