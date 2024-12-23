import { ActorSubclass, HttpAgent, Identity } from '@dfinity/agent';
import { InterfaceFactory } from '@dfinity/candid/lib/cjs/idl';
import { Principal } from '@dfinity/principal';
import { AuthClient } from './icAuthClient';
import { ICWindow } from './icWindow';
import { ConnectOptions, DelegationMode, PermissionsType, SignerOptions, SignerResponseSuccess, TransactionOptions, TransactionResponseSuccess } from '../types';
import { Wallet } from '@astrox/sdk-core';
declare global {
    interface Window {
        ic: IC & any;
    }
}
export interface LoginOptions {
    identityProvider: string | URL;
    maxTimeToLive: bigint;
    permissions: PermissionsType[];
    delegationTargets: string[] | undefined;
    delegationModes?: Array<DelegationMode>;
}
export declare class IC extends ICWindow {
    #private;
    protected constructor(authClient: AuthClient, agent: HttpAgent);
    static create(config: any): Promise<IC>;
    connect(connectOptions: ConnectOptions): Promise<IC>;
    isAuthenticated(): Promise<boolean>;
    get identity(): Identity;
    get principal(): Principal;
    get wallet(): Wallet | undefined;
    get delegationTargets(): string[];
    private _setWalletProvider;
    private _setSignerProvider;
    private _setUseFrame;
    private _setConnectOptions;
    private _setLoginOptions;
    get loginOption(): LoginOptions | undefined;
    get connectOptions(): ConnectOptions | undefined;
    protected getAuthClient(): AuthClient;
    disconnect: (options?: {
        returnTo?: string;
    }) => Promise<void>;
    queryBalance: () => Promise<bigint>;
    handleAuthenticated: ({ ledgerCanisterId, ledgerHost }: {
        ledgerCanisterId?: string;
        ledgerHost?: string;
    }) => Promise<void>;
    private injectWindow;
    private _appendAuth;
    handleError(error?: string): void;
    createActor: <T>(idlFactory: InterfaceFactory, canisterId: string) => Promise<ActorSubclass<T>>;
    requestTransfer: (options: TransactionOptions) => Promise<TransactionResponseSuccess | undefined | string>;
    signMessage: (options: SignerOptions) => Promise<SignerResponseSuccess | undefined | string>;
    private _getSignerHandler;
    private _getEventHandler;
    private _handleFailure;
    private _handleSuccess;
}
