import type { HashAlgorithm } from './common.types';

export interface PayoutModuleOptions {
  /** Point ID (Amega-UserId header) */
  pointId: string;
  /** RSA private key in DER format (PKCS#1). Load with fs.readFileSync('keys/secret.key') */
  privateKey: Buffer;
  /** Hash algorithm for signing. Default: 'sha256' */
  hashAlgorithm?: HashAlgorithm;
  /** Use sandbox environment (dev1.payin-payout.net). Default: false */
  sandbox?: boolean;
  /** Custom base URL override */
  baseUrl?: string;
  /** Request timeout in ms. Default: 30000 */
  timeout?: number;
}

export interface PayoutModuleAsyncOptions {
  imports?: any[];
  useFactory: (
    ...args: any[]
  ) => PayoutModuleOptions | Promise<PayoutModuleOptions>;
  inject?: any[];
}
