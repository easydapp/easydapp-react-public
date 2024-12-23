import { Memo } from '../utils';

export interface SendOpts {
  fee?: bigint;
  memo?: Memo | Array<number>;
  from_subaccount?: Array<number>;
  created_at_time?: Date | number;
}

export interface BaseTransactionRequest {
  to: string;
  standard: string;
  sendOpts?: SendOpts;
}

export interface TransferToken extends BaseTransactionRequest {
  amount: bigint;
  symbol: 'WICP' | 'XTC' | 'OGY' | 'ICP' | 'GHOST' | string;
  standard: 'ICP' | 'DIP20' | 'EXT' | 'DRC20' | string;
}

export interface TransferNFTWithIdentifier extends BaseTransactionRequest {
  tokenIdentifier: string;
  tokenIndex: number;
  canisterId: string;
  standard: string;
}
