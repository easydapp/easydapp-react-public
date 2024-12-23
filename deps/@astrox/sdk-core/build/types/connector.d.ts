import { ActorSubclass } from '@dfinity/agent';
import { IDL } from '@dfinity/candid';
import { JsonnableDelegationChain } from '@dfinity/identity/lib/cjs/identity/delegation';
import { BaseTransactionRequest } from './transfer';
export interface Wallet {
    accountId: string;
    principal: string;
}
export interface BaseConnectResponse {
    chain?: JsonnableDelegationChain;
    wallet?: Wallet;
    confirm?: boolean;
}
export interface IConnector {
    init: () => Promise<boolean>;
    config: any;
    isConnected: () => Promise<boolean>;
    createActor: <T>(canisterId: string, interfaceFactory: IDL.InterfaceFactory) => Promise<ActorSubclass<T> | undefined>;
    connect: (params: {
        delegationTargets?: Array<string>;
        host: string;
    }) => Promise<BaseConnectResponse | boolean>;
    disconnect: () => Promise<boolean>;
    principal: string | undefined;
}
export interface IWalletConnector extends IConnector {
    address: () => {
        principal?: string;
        accountId?: string;
    };
    requestTransfer: (baseTx: BaseTransactionRequest) => Promise<any>;
    queryBalance: () => Promise<Array<{
        amount: number;
        canisterId: string;
        decimals: number;
        image?: string;
        name: string;
        symbol: string;
    }> | undefined>;
    signMessage?: (message: any) => Promise<any>;
}
