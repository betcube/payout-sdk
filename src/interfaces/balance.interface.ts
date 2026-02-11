import type { PayoutCurrency } from './common.types';

export interface GetBalanceRequest {
  /** Currency code (643, 840, 978) or 'ALL'. Omit for RUR only. */
  currency?: PayoutCurrency;
}

export interface BalanceEntry {
  currency: string;
  amount: string;
}

export interface GetBalanceResponse {
  balances: BalanceEntry[];
}
