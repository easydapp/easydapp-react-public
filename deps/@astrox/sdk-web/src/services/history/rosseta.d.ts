import { DelegationIdentity } from '@dfinity/identity';
import { TransactionResponse } from '../../connections/ledgerConnection';
import { GetTransactionsResponse } from '../../canisters/nns-dapp';
export declare const MILI_PER_SECOND = 1000000;
export declare enum RosettaTransactionStatus {
    COMPLETED = "COMPLETED",
    REVERTED = "REVERTED",
    PENDING = "PENDING"
}
export declare enum RosettaTransactionType {
    TRANSACTION = "TRANSACTION",
    FEE = "FEE",
    RECEIVE = "RECEIVE",
    SEND = "SEND"
}
export interface Currency {
    symbol: string;
    decimals: number;
}
export interface InnerUsedTransactionDetail {
    to?: string;
    from: string;
    status?: RosettaTransactionStatus;
    amount?: string;
    currency?: {
        symbol: string;
        decimals: number;
    };
    fee: {
        amount?: string;
        currency?: {
            symbol: string;
            decimals: number;
        };
    };
}
export interface InnerUsedTransaction {
    type: RosettaTransactionType;
    details: InnerUsedTransactionDetail;
}
export interface InferredTransaction {
    hash: string;
    timestamp: string;
    type: RosettaTransactionType;
    details: InnerUsedTransactionDetail;
    caller: string;
    block_height: string;
    memo: string;
    lockTime: string;
}
export interface GetRossetaTransactionsResponse {
    total: number;
    transactions: InferredTransaction[];
}
export declare const getICPTransactions: (accountId: string) => Promise<GetRossetaTransactionsResponse>;
export declare const getTransactions: (localDelegationIdentity: DelegationIdentity, fromAccount: string) => Promise<GetTransactionsResponse>;
export declare const getICPTransactionsByBlock: (fromAccount: string, blockHeight: bigint) => Promise<{
    total: any;
    transactions: any;
}>;
export declare const getExactTransaction: (fromAccount: string, singleResponse: TransactionResponse, txns: GetTransactionsResponse) => InferredTransaction | undefined;
export declare const getTransactionFromRosseta: (fromAccount: string, singleResponse: TransactionResponse, txns: GetRossetaTransactionsResponse) => InferredTransaction | undefined;
