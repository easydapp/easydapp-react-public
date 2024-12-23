import {
  AbstractedClientStorage,
  BaseTransactionRequest,
  IWalletConnector,
  TransferNFTWithIdentifier,
  TransferToken,
  Wallet,
} from '@astrox/sdk-core';

import { DelegationChain } from '@dfinity/identity';
import { Actor, ActorSubclass, HttpAgent, PublicKey, SignIdentity } from '@dfinity/agent';
import { isDelegationValid } from './util';
import { ICStorage } from './storage';
import * as _ms from './methods';
import { Principal } from '@dfinity/principal';
import { InterfaceFactory } from '@dfinity/candid/lib/cjs/idl';
import {
  BalanceResponseObject,
  DelegationMode,
  NFTTransferResponse,
  SupportedToken,
  TokenTransferResponse,
  TransactionMessageKind,
  TransactionResponse,
  TransactionResponseFailure,
  TransactionType,
  WebViewAuthResponse,
  WebViewConnectRequest,
} from './types';
import { AstroXIdentity } from './identity';
import { BridgeErrors } from './errors';
import './cbor';

const KEY_ICSTORAGE_CACHEKEY = 'cacheKey';
const KEY_ICSTORAGE_CHAIN = 'chain';
const KEY_ICSTORAGE_WALLET = 'wallet';
const KEY_ICSTORAGE_CONFIRM = 'confirm';
const KEY_ICSTORAGE_HOST = 'host';
const KEY_CUSTOM_DOMAIN = 'customDomain';

export class AstroXWebViewHandler implements IWalletConnector {
  principal: string | undefined;
  private _isReady: boolean = false;

  constructor(
    private _identity?: SignIdentity,
    private _agent?: HttpAgent,
    private _chain?: DelegationChain,
    private _storage?: AbstractedClientStorage,
    private _cacheKey?: string,
    private _wallet?: Wallet,
    private _confirm?: boolean,
    private _host?: string,
    private _customDomain?: string,
  ) {
    this._injectWindow();
  }

  private setCacheKey(value: string) {
    this._cacheKey = value;
    this._storage!.set(KEY_ICSTORAGE_CACHEKEY, value);
  }

  private get cacheKey(): string | undefined {
    return this._cacheKey;
  }

  private setWallet(value: Wallet) {
    this._wallet = value;
    this._storage!.set(KEY_ICSTORAGE_WALLET, JSON.stringify({ ...value }));
  }

  public get wallet(): Wallet {
    return this._wallet!;
  }

  private setChain(value: DelegationChain) {
    this._chain = value;
    this._storage!.set(KEY_ICSTORAGE_CHAIN, JSON.stringify(value?.toJSON()));
  }

  private get chain(): DelegationChain | undefined {
    return this._chain;
  }

  private setConfirm(value: boolean) {
    this._confirm = value;
    this._storage!.set(KEY_ICSTORAGE_CONFIRM, String(value));
  }

  private get confirm(): boolean | undefined {
    return this._confirm;
  }

  private setIdentity(value: SignIdentity) {
    this._identity = value;
  }

  public get identity(): SignIdentity | undefined {
    return this._identity;
  }

  public setAgent(value: HttpAgent) {
    this._agent = value;
  }

  public setHost(host: string) {
    this._host = host;
    this._storage!.set(KEY_ICSTORAGE_HOST, String(host));
  }

  public setCustomDomain(customDomain: string) {
    this._customDomain = customDomain;
    this._storage!.set(KEY_CUSTOM_DOMAIN, String(customDomain));
  }

  get host(): string {
    return this._host!;
  }

  get customDomain(): string {
    return this._customDomain!;
  }

  public get agent(): HttpAgent | undefined {
    return this._agent;
  }

  public setStorage(storage: AbstractedClientStorage) {
    this._storage = storage;
  }

  public get storage(): AbstractedClientStorage {
    return this._storage!;
  }

  private clear() {
    this._cacheKey = undefined;
    this._confirm = undefined;
    this._chain = undefined;
    this._wallet = undefined;
    this._identity = undefined;
    this._agent = undefined;
    this._storage!.remove(KEY_ICSTORAGE_CACHEKEY);
    this._storage!.remove(KEY_ICSTORAGE_WALLET);
    this._storage!.remove(KEY_ICSTORAGE_CHAIN);
    this._storage!.remove(KEY_ICSTORAGE_CONFIRM);
    this._storage!.remove(KEY_ICSTORAGE_HOST);
    this._storage!.remove(KEY_CUSTOM_DOMAIN);
  }

  private _injectWindow() {
    (window as any).icx = this;
  }

  private async _initBridge() {
    try {
      await this.fromStorage();
      this._isReady = true;
    } catch (e) {
      console.log('AstroXWebViewBridge occurs error:', e);
      throw e;
    }
  }

  private async fromStorage(): Promise<void> {
    const storage = new ICStorage('astrox-');
    const cacheKey = await storage.get(KEY_ICSTORAGE_CACHEKEY);
    this.setStorage(storage);
    if (cacheKey) {
      // Check flutter side identity state.
      const connected = await _ms.isConnected.invoke(cacheKey);
      if (!connected) {
        this.clear();
        return;
      }
      const chainString = await storage.get(KEY_ICSTORAGE_CHAIN);
      const chain = chainString ? DelegationChain.fromJSON(chainString) : null;
      // Check local DelegationChain is valid.
      if (!chain || !isDelegationValid(chain)) {
        this.clear();
        return;
      }
      const identity = new AstroXIdentity(cacheKey, chain);
      const walletJson = await storage.get(KEY_ICSTORAGE_WALLET);
      const hostString = await storage.get(KEY_ICSTORAGE_HOST);
      const customDomainString = await storage.get(KEY_CUSTOM_DOMAIN);
      this.setHost(hostString!);
      this.setCacheKey(cacheKey);
      this.setChain(chain);
      this.setWallet(walletJson ? JSON.parse(walletJson) : null);
      this.setConfirm((await storage.get(KEY_ICSTORAGE_CONFIRM)) == 'true');
      this.setIdentity(identity);
      this.setAgent(new HttpAgent({ identity, host: hostString ?? window.location.origin }));
      this.setCustomDomain(customDomainString!);
    }
  }

  public isReady(): boolean {
    return !!(window as any).astrox_webview && this._isReady;
  }

  public getDelegation(): DelegationChain | undefined {
    return this._chain;
  }

  public getPublicKey(): PublicKey | undefined {
    return this._identity?.getPublicKey();
  }

  public getPrincipal(): Principal | undefined {
    return this._identity?.getPrincipal();
  }

  private _assertEnv() {
    if (!this.isReady()) {
      throw Error('Webview Bridge is not ready');
    }
  }

  public async connect(params: WebViewConnectRequest): Promise<boolean> {
    this._assertEnv();
    if (!this.identity) {
      return this.reconnect(params);
    }
    return true;
  }

  public async reconnect(params: WebViewConnectRequest): Promise<boolean> {
    this._assertEnv();
    let delegationModes = params.delegationModes;
    if (delegationModes && delegationModes.length) {
      const modes: DelegationMode[] = ['global', 'domain'];
      const hasNotInclude = delegationModes.some(v => !modes.includes(v));
      if (hasNotInclude) {
        throw new Error('`delegationModes` elements only support `global` and `domain`');
      }
      delegationModes = [...new Set(delegationModes)];
    }
    const result = await _ms.connect.invoke({
      ...params,
      host: params.customDomain ?? window.location.origin,
      delegationTargets: params.delegationTargets?.filter(value => typeof value === 'string' && value.trim()),
      delegationModes,
    });
    return this._handleWebViewConnectResponse(result, params.host, params.customDomain);
  }

  private _handleWebViewConnectResponse(result: WebViewAuthResponse, host?: string, customDomain?: string): boolean {
    const { authorized, payload } = result;
    if (!authorized) {
      return false;
    }
    if (!payload) {
      return true;
    }
    if (!payload.chain) {
      return false;
    }
    let chainObject: DelegationChain | undefined;
    try {
      chainObject = DelegationChain.fromJSON(payload.chain);
    } catch (error) {
      return false;
    }
    if (isDelegationValid(chainObject)) {
      this.setChain(chainObject);
      this.setCacheKey(payload.cacheKey);
      this.setWallet(payload.wallet!);
      this.setIdentity(new AstroXIdentity(this._cacheKey!, this._chain!));
      this.setConfirm(payload.confirm === true);
      this.setAgent(new HttpAgent({ identity: this._identity, host: host ?? window.location.origin }));
      this.setHost(host ?? window.location.origin);
      this.setCustomDomain(customDomain!);
      return true;
    }
    return false;
  }

  public async getSupportedTokenList(): Promise<Array<SupportedToken>> {
    this._assertEnv();
    return _ms.supportedStandardList.invoke();
  }

  public async isConnected(): Promise<boolean> {
    this._assertEnv();
    return !!this.cacheKey && (await _ms.isConnected.invoke(this.cacheKey));
  }

  public async disconnect(): Promise<boolean> {
    this._assertEnv();
    this.cacheKey && (await _ms.disconnect.invoke(this.cacheKey));
    this.clear();
    return true;
  }

  public async signMessage(message: any): Promise<any> {
    throw new Error('Unsupported api');
  }

  public async requestTransfer(req: BaseTransactionRequest): Promise<TransactionResponse> {
    this._assertEnv();

    if (!this.cacheKey) {
      return BridgeErrors.fromErrorCode(BridgeErrors.bridgeIdentityNotFound, TransactionMessageKind.fail);
    }

    if (!this._wallet) {
      return BridgeErrors.fromErrorCode(BridgeErrors.bridgeWalletNotFound, TransactionMessageKind.fail);
    }

    let rawSendOpts = req.sendOpts;
    let sendOpts;
    if (rawSendOpts) {
      const memo = rawSendOpts.memo;
      if (memo) {
        const standard = req.standard.toUpperCase();
        if (standard === 'EXT' && !Array.isArray(memo)) {
          throw new Error('`sendOpts.memo` only supports `Array<number>` type when the standard is `EXT`');
        }
        if (standard === 'ICP' && typeof memo !== 'bigint') {
          throw new Error('`sendOpts.memo` only supports `bigint` type when the standard is `ICP`');
        }
      }
      let createdAtTime = rawSendOpts.created_at_time;
      sendOpts = { ...rawSendOpts };
      if (createdAtTime) {
        if (createdAtTime instanceof Date) {
          sendOpts.created_at_time = createdAtTime.getTime();
        }
      }
    }
    try {
      let txType: TransactionType = (req as TransferToken).symbol !== undefined ? TransactionType.token : TransactionType.nft;

      const success = await _ms.requestTransfer.invoke(
        this.cacheKey,
        {
          ...req,
          sendOpts,
        },
        this._wallet,
      );

      switch (txType) {
        case TransactionType.token:
          return {
            kind: TransactionMessageKind.success,
            type: txType,
            payload: {
              ...success,
              originPayload: req as TransferToken,
            } as TokenTransferResponse,
          };
        case TransactionType.nft:
          return {
            kind: TransactionMessageKind.success,
            type: txType,
            payload: {
              success: true,
              originPayload: req as TransferNFTWithIdentifier,
            } as NFTTransferResponse,
          };
      }
    } catch (e) {
      const { code, message } = JSON.parse((e as Error).message) as {
        code: number;
        message: string;
      };

      return BridgeErrors.fromErrorCode(code, TransactionMessageKind.fail, message) as TransactionResponseFailure;
    }
  }

  public async queryBalance(): Promise<BalanceResponseObject[]> {
    this._assertEnv();
    return await _ms.queryBalance.invoke({ ...this.wallet });
  }

  config: any;
  public createActor = async <T>(canisterId: string, idlFactory: InterfaceFactory): Promise<ActorSubclass<T>> => {
    this._assertEnv();
    if (this._confirm) {
      const authed = this._handleWebViewConnectResponse(
        await _ms.appendAuth.invoke(this._cacheKey, this._wallet, [canisterId]),
        this.host,
        this.customDomain,
      );
      if (!authed) {
        throw new Error('User cancel authorization');
      }
    }
    return Actor.createActor<T>(idlFactory, {
      agent: this._agent,
      canisterId,
    });
  };

  public address(): { principal?: string; accountId?: string } {
    return { ...this.wallet };
  }

  public async init(): Promise<any> {
    await this._initBridge();
    this._assertEnv();
  }
}
