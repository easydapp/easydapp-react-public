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
  // TODO: Result type
  createActor: <T>(canisterId: string, interfaceFactory: IDL.InterfaceFactory) => Promise<ActorSubclass<T> | undefined>;
  // TODO: Result type
  connect: (params: { delegationTargets?: Array<string>; host: string }) => Promise<BaseConnectResponse | boolean>;
  // TODO: Result type
  disconnect: () => Promise<boolean>;
  principal: string | undefined;
}

export interface IWalletConnector extends IConnector {
  // TODO: Result type?
  address: () => {
    principal?: string;
    accountId?: string;
  };
  requestTransfer: (baseTx: BaseTransactionRequest) => Promise<any>;
  queryBalance: () => Promise<
    | Array<{
        amount: number;
        canisterId: string;
        decimals: number;
        image?: string;
        name: string;
        symbol: string;
      }>
    | undefined
  >;
  signMessage?: (message: any) => Promise<any>;
  // getManagementCanister: (any) => Promise<any>
  // callClientRPC: (any) => Promise<any>
  // requestBurnXTC: (any) => Promise<any>
  // batchTransactions: (any) => Promise<any>
}

// type ProviderOptions = {
//   connector: IConnector,
// }
