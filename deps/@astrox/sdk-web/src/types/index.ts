/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActorSubclass, HttpAgent, SignIdentity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { AccountIdentifier, Memo } from '../utils/common/types';
import { DelegationChain, DelegationIdentity } from '@dfinity/identity';
import { AbstractedClientStorage, Wallet } from '@astrox/sdk-core';
import { IC } from '../ic';

export type DelegationMode = 'global' | 'domain';

export interface IIDelegationResult {
  delegation: {
    pubkey: Uint8Array;
    expiration: bigint;
    targets?: Principal[];
  };
  signature: Uint8Array;
}

export interface DelegationMessage {
  kind: string;
  delegations: IIDelegationResult[];
  userPublicKey: Uint8Array;
}

export interface HandleDelegationResult {
  delegationChain: DelegationChain;
  delegationIdentity: DelegationIdentity;
}

export interface AbstractConnection<T> {
  identity: SignIdentity;
  delegationIdentity: DelegationIdentity;
  actor?: ActorSubclass<T>;
  agent?: HttpAgent;
  canisterId?: string;
  getActor(): Promise<ActorSubclass<T>>;
}

export interface CreateActorResult<T> {
  actor: ActorSubclass<T>;
  agent: HttpAgent;
}

export interface SendOpts {
  fee?: bigint;
  memo?: Memo | Array<number>;
  from_subaccount?: Array<number>;
  created_at_time?: Date;
}

/**
 * List of options for creating an {@link AuthClient}.
 */
export interface AuthClientCreateOptions {
  /**
   * An identity to use as the base
   */
  identity?: SignIdentity;
  /**
   * Optional storage with get, set, and remove. Uses SessionStorage by default
   */
  storage?: AbstractedClientStorage;
  // appId
  appId?: string;
  whitelistApi?: string;
  whitelistCanister?: string;
  idpWindowOption?: string;
}

export interface AuthClientLoginOptions extends AuthClientCreateOptions {
  /**
   * Identity provider. By default, use the identity service.
   */
  authType?: AuthClientType;

  identityProvider?: string | URL;

  permissions?: PermissionsType[];
  delegationTargets?: string[];
  whitelist?: string[];
  host?: string;
  noUnify?: boolean;
  delegationModes?: Array<DelegationMode>;
  customDomain?: string;
  /**
   * Experiation of the authentication
   */
  maxTimeToLive?: bigint;
  /**
   * Callback once login has completed
   */
  onSuccess?: () => void | Promise<void>;
  /**
   * Callback in case authentication fails
   */
  onError?: (error?: string) => void;

  /**
   * Callback once is authenticated
   */
  onAuthenticated?: (ic: IC) => void | Promise<void>;
}

export interface ConnectOptions extends AuthClientLoginOptions {
  ledgerCanisterId?: string;
  ledgerHost?: string;
  walletProviderUrl?: string;
  signerProviderUrl?: string;
  dev?: boolean;
  useFrame?: boolean;
}

export interface BaseTransaction {
  /**
   * Identity provider. By default, use the identity service.
   */
  walletProvider?: string | URL;
  sendOpts: SendOpts;
  maxTimeout?: number;
  successTimeout?: number;
  /**
   * Callback once login has completed
   */
  onSuccess?: (value?: any) => void | Promise<void>;
  /**
   * Callback in case authentication fails
   */
  onError?: (error?: string) => void;
  from?: AccountIdentifier;
  to: AccountIdentifier;
  standard: string;
}

export interface TransactionToken extends BaseTransaction {
  amount?: bigint;
  symbol: string;
}

export interface TransactionNFT extends BaseTransaction {
  tokenIndex?: number;
  canisterId?: string;
  tokenIdentifier?: string;
}

export type TransactionOptions = TransactionNFT | TransactionToken;

export interface SignerOptions {
  /**
   * Identity provider. By default, use the identity service.
   */
  signerProvider?: string | URL;
  from?: AccountIdentifier;
  message: Uint8Array | string; //
  maxTimeout?: number;
  successTimeout?: number;
  /**
   * Callback once login has completed
   */
  onSuccess?: (value?: any) => void | Promise<void>;
  /**
   * Callback in case authentication fails
   */
  onError?: (error?: string) => void;
}

export type AuthClientType = 'authorize-client' | 'authorize-append';

export interface InternetIdentityAuthRequest {
  kind: AuthClientType;
  sessionPublicKey: Uint8Array;
  permissions?: PermissionsType[];
  delegationTargets?: string[];
  delegationModes?: Array<DelegationMode>;
  noUnify?: boolean;
  maxTimeToLive?: bigint;
  appId?: string;
  host?: string;
}

export interface AuthRequestJSON {
  lastRequest: {
    maxTimeToLive: string;
    kind: AuthClientType;
    sessionPublicKey: Uint8Array;
    permissions?: PermissionsType[];
    delegationTargets?: string[];
    noUnify?: boolean;
    appId?: string;
  };
  confirm: boolean;
}

export interface DelegationResult {
  delegations: {
    delegation: {
      pubkey: Uint8Array;
      expiration: bigint;
      targets?: string[];
    };
    signature: Uint8Array;
  }[];
  userPublicKey: Uint8Array;
}

export interface MeAuthResponseSuccess {
  kind: 'authorize-client-success';
  identity: DelegationResult;
  confirm?: boolean;
  wallet?: Wallet;
}

export interface IIAuthResponseSuccess extends DelegationResult {
  kind: 'authorize-client-success';
}

export type AuthResponseSuccess = MeAuthResponseSuccess | IIAuthResponseSuccess;

export type EventHandler = (event: MessageEvent) => Promise<void>;

export enum PermissionsType {
  identity = 'permissions-identity',
  wallet = 'permissions-wallet',
}

export enum SignerMessageKind {
  client = 'signer-client',
  ready = 'signer-ready',
  success = 'signer-client-success',
  fail = 'signer-client-failure',
}

export interface SignerReadyMessage {
  kind: SignerMessageKind.ready;
}

export interface SignerResponseFailure {
  kind: SignerMessageKind.fail;
  text: string;
}

export interface SignerResponseFailure {
  kind: SignerMessageKind.fail;
  text: string;
}

export interface SignerResponseSuccess {
  kind: SignerMessageKind.success;
  payload?: {
    publicKey: string;
    signature: string;
    originPayload: {
      message: Uint8Array;
    };
  };
}

export type SignerResponseMessage = SignerReadyMessage | SignerResponse;
export type SignerResponse = SignerResponseSuccess | SignerResponseFailure;

// Transaction Types
export enum TransactionMessageKind {
  client = 'transaction-client',
  ready = 'transaction-ready',
  success = 'transaction-client-success',
  fail = 'transaction-client-failure',
}

export interface TransactionReadyMessage {
  kind: TransactionMessageKind.ready;
}

export interface TransactionResponseFailure {
  kind: TransactionMessageKind.fail;
  text: string;
}

export interface TransactionResponseSuccess {
  kind: TransactionMessageKind.success;
  payload?: {
    blockHeight: bigint;
    originPayload: {
      to: AccountIdentifier;
      amount: bigint;
      sendOpts?: Partial<SendOpts>;
    };
  };
}

export type TransactionResponseMessage = TransactionReadyMessage | TransactionResponse;
export type TransactionResponse = TransactionResponseSuccess | TransactionResponseFailure;

export interface AuthReadyMessage {
  kind: 'authorize-ready';
}

export interface AuthResponseFailure {
  kind: 'authorize-client-failure';
  text: string;
}

export type IdentityServiceResponseMessage = AuthReadyMessage | AuthResponse;
export type AuthResponse = AuthResponseSuccess | AuthResponseFailure;
