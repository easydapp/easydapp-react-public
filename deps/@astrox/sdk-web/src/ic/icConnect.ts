/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Actor, ActorSubclass, HttpAgent, Identity } from '@dfinity/agent';
import { InterfaceFactory } from '@dfinity/candid/lib/cjs/idl';
import { Principal } from '@dfinity/principal';
import { AuthClient } from './icAuthClient';
import { IDENTITY_PROVIDER_DEFAULT } from './icStorage';
import { ICWindow } from './icWindow';
import { LedgerConnection } from '../connections/ledgerConnection';
import {
  ConnectOptions,
  DelegationMode,
  EventHandler,
  PermissionsType,
  SignerMessageKind,
  SignerOptions,
  SignerResponseFailure,
  SignerResponseMessage,
  SignerResponseSuccess,
  TransactionMessageKind,
  TransactionOptions,
  TransactionResponseFailure,
  TransactionResponseMessage,
  TransactionResponseSuccess,
} from '../types';
import { Wallet } from '@astrox/sdk-core';

const days = BigInt(1);
const hours = BigInt(24);
const nanoseconds = BigInt(3600000000000);
const WALLET_PROVIDER_DEFAULT = 'https://63k2f-nyaaa-aaaah-aakla-cai.raw.ic0.app';
const WALLET_PROVIDER_ENDPOINT = '#transaction';
const SIGNER_PROVIDER_DEFAULT = 'https://63k2f-nyaaa-aaaah-aakla-cai.raw.ic0.app';
const SIGNER_PROVIDER_ENDPOINT = '#signer';

declare global {
  interface Window {
    ic: IC & any;
  }
}

function targetsFilter(arr: unknown[]) {
  return arr.filter(value => typeof value === 'string' && value.trim());
}

export interface LoginOptions {
  identityProvider: string | URL;
  // Maximum authorization expiration is 8 days
  maxTimeToLive: bigint;
  permissions: PermissionsType[];
  delegationTargets: string[] | undefined;
  delegationModes?: Array<DelegationMode>;
}

const FRAME_SETTING = 'height=600, width=800, top=0, right=0, toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no';
const FRAME_SETTING_PAYMENT = 'height=600, width=480, top=0, right=0, toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no';

export class IC extends ICWindow {
  #authClient: AuthClient;
  #agent?: HttpAgent;
  #localLedger?: LedgerConnection;
  #walletProvider?: string;
  #signerProvider?: string;
  #useFrame?= false; // a local ledger to query balance only
  #loginOption?: LoginOptions;
  #connectOptions?: ConnectOptions;

  protected constructor(authClient: AuthClient, agent: HttpAgent) {
    super();
    this.#authClient = authClient;
    this.#agent = agent;
    this.injectWindow();
  }

  public static async create(config: any): Promise<IC> {
    let delegationTargets: string[] = ['ryjl3-tyaaa-aaaaa-aaaba-cai'];

    if (config && config?.delegationTargets) {
      delegationTargets = [...new Set(delegationTargets.concat(config?.delegationTargets))];
    }
    if (config && config?.ledgerCanisterId) {
      delegationTargets = [...new Set(delegationTargets.concat(config?.ledgerCanisterId))];
    }
    if (config && config?.whitelist) {
      delegationTargets = [...new Set(delegationTargets.concat(config?.whitelist))];
    }

    delegationTargets = targetsFilter([...new Set(delegationTargets)]) as string[];

    const authClient = await AuthClient.create({
      ...config,
      delegationTargets,
      idpWindowOption: config.useFrame === true ? FRAME_SETTING : undefined,
    });

    const identity = authClient.getIdentity();
    const agent = new HttpAgent({ identity, host: config.host ?? window.location.origin });
    if (config.dev) {
      await agent.fetchRootKey();
    }
    const newIC = new IC(authClient, agent);

    newIC._setWalletProvider(config?.walletProviderUrl);
    newIC._setSignerProvider(config?.signerProviderUrl);
    newIC._setUseFrame(config?.useFrame);

    if (await newIC.isAuthenticated()) {
      await newIC.handleAuthenticated({
        ledgerCanisterId: config.ledgerCanisterId ?? 'ryjl3-tyaaa-aaaaa-aaaba-cai',
        ledgerHost: config.ledgerHost ?? 'https://boundary.ic0.app/',
      });
      await config?.onAuthenticated?.(newIC);
    }
    const provider = config?.identityProvider ?? IDENTITY_PROVIDER_DEFAULT;
    newIC._setConnectOptions({ ...config, dev: config.dev, delegationTargets });
    newIC._setLoginOptions({
      ...config,
      identityProvider: provider,
      // Maximum authorization expiration is 8 days
      maxTimeToLive: config?.maxTimeToLive ?? days * hours * nanoseconds,
      permissions: config?.permissions ?? [PermissionsType.identity],
      delegationTargets,
    });
    return newIC;
  }

  public async connect(connectOptions: ConnectOptions): Promise<IC> {
    let delegationModes = connectOptions.delegationModes;
    if (delegationModes && delegationModes.length) {
      const modes: DelegationMode[] = ['global', 'domain'];
      const hasNotInclude = delegationModes.some(v => !modes.includes(v));
      if (hasNotInclude) {
        throw new Error('`delegationModes` elements only support `global` and `private`');
      }
      delegationModes = [...new Set(delegationModes)];
    }
    const provider = connectOptions?.identityProvider ?? IDENTITY_PROVIDER_DEFAULT;

    let delegationTargets: string[] = ['ryjl3-tyaaa-aaaaa-aaaba-cai'];

    if (connectOptions && connectOptions?.delegationTargets) {
      delegationTargets = [...new Set(delegationTargets.concat(connectOptions?.delegationTargets))];
    }
    if (connectOptions && connectOptions?.ledgerCanisterId) {
      delegationTargets = [...new Set(delegationTargets.concat(connectOptions?.ledgerCanisterId))];
    }
    if (connectOptions && connectOptions?.whitelist) {
      delegationTargets = [...new Set(delegationTargets.concat(connectOptions?.whitelist))];
    }

    delegationTargets = targetsFilter([...new Set(delegationTargets)]) as string[];

    this._setConnectOptions({ ...connectOptions, delegationTargets });
    this._setLoginOptions({
      ...connectOptions,
      identityProvider: provider,
      // Maximum authorization expiration is 8 days
      maxTimeToLive: connectOptions?.maxTimeToLive ?? days * hours * nanoseconds,
      permissions: connectOptions?.permissions ?? [PermissionsType.identity],
      delegationTargets,
      delegationModes,
    });
    await new Promise((resolve, reject) => {
      this.getAuthClient().login({
        ...this.#loginOption,
        onSuccess: async () => {
          const identity = this.getAuthClient().getIdentity();
          this.#agent = new HttpAgent({ identity, host: connectOptions.host ?? window.location.origin });

          if (connectOptions.dev) {
            await this.#agent.fetchRootKey();
          }

          await this.handleAuthenticated({
            ledgerCanisterId: connectOptions.ledgerCanisterId,
            ledgerHost: connectOptions.ledgerHost ?? 'https://boundary.ic0.app/',
          });
          connectOptions?.onSuccess ? await connectOptions?.onSuccess?.() : await connectOptions?.onAuthenticated?.(this);
          resolve(this);
        },
        onError: this.handleError,
      });
    });
    return this;
  }

  public async isAuthenticated(): Promise<boolean> {
    const result = await this.#authClient.isAuthenticated();
    return result;
  }

  public get identity(): Identity {
    return this.#authClient.getIdentity();
  }

  public get principal(): Principal {
    return this.identity.getPrincipal();
  }

  public get wallet(): Wallet | undefined {
    return this.#authClient.wallet;
  }

  public get delegationTargets(): string[] {
    return this.#authClient.getDelegateTargets();
  }

  private _setWalletProvider(provider?: string) {
    this.#walletProvider = provider;
  }

  private _setSignerProvider(provider?: string) {
    this.#signerProvider = provider;
  }

  private _setUseFrame(useFrame: boolean) {
    this.#useFrame = useFrame;
  }

  private _setConnectOptions(options: ConnectOptions) {
    this.#connectOptions = options;
  }

  private _setLoginOptions(options: LoginOptions) {
    this.#loginOption = options;
  }

  public get loginOption() {
    return this.#loginOption;
  }

  public get connectOptions() {
    return this.#connectOptions;
  }

  protected getAuthClient(): AuthClient {
    return this.#authClient;
  }

  public disconnect = async (options: { returnTo?: string } = {}): Promise<void> => {
    this.#agent = undefined;
    this.#localLedger = undefined;
    this.#walletProvider = undefined;
    this.#signerProvider = undefined;
    this.#loginOption = undefined;
    this.#connectOptions = undefined;
    await this.getAuthClient().logout(options);
  };

  public queryBalance = async (): Promise<bigint> => {
    if (this.wallet === undefined) {
      throw Error('Wallet address is not found');
    }
    if (this.#localLedger === undefined) {
      throw Error('Ledger connection failed');
    }
    const result = await this.#localLedger?.getBalance(this.wallet!.accountId);
    return result;
  };

  public handleAuthenticated = async ({ ledgerCanisterId, ledgerHost }: { ledgerCanisterId?: string; ledgerHost?: string }): Promise<void> => {
    const actorResult = await LedgerConnection.createActor(this.getAuthClient().getDelegationIdentity()!, ledgerCanisterId, ledgerHost);

    this.#localLedger = LedgerConnection.createConnection(
      this.getAuthClient().getInnerKey()!,
      this.getAuthClient().getDelegationIdentity()!,
      ledgerCanisterId,
      actorResult.actor,
      this.#agent,
    );
  };

  private injectWindow(): void {
    if (window.ic !== undefined) {
      window.ic.astrox = this;
    } else {
      window.ic = { astrox: this };
    }
  }

  private async _appendAuth(canisterId: string): Promise<IC> {
    const currentTargets = targetsFilter(this.#authClient.getDelegateTargets()) as string[];
    if (currentTargets.includes(canisterId)) {
      return this;
    } else {
      let newTargets = [...currentTargets, canisterId];
      newTargets = targetsFilter(newTargets) as string[];
      this._setConnectOptions({ ...this.#connectOptions, delegationTargets: newTargets });
      this._setLoginOptions({
        ...this.#loginOption!,
        delegationTargets: newTargets,
      });
      return await new Promise((resolve, reject) => {
        this.getAuthClient().login({
          ...this.#loginOption,
          authType: 'authorize-append',
          delegationTargets: newTargets,
          onSuccess: async () => {
            const identity = this.getAuthClient().getIdentity();
            this.#agent = new HttpAgent({ identity, host: this.#connectOptions !== undefined ? this.#connectOptions.host : window.location.origin });
            if (this.#connectOptions?.dev) {
              await this.#agent.fetchRootKey();
            }
            await this.handleAuthenticated({
              ledgerCanisterId: this.#connectOptions?.ledgerCanisterId,
              ledgerHost: this.#connectOptions?.ledgerHost ?? 'https://boundary.ic0.app/',
            });
            (await this.#connectOptions?.onSuccess) ? await this.#connectOptions?.onSuccess?.() : await this.#connectOptions?.onAuthenticated?.(this);
            resolve(this);
          },
          onError: this.handleError,
        });
      });
    }
  }

  public handleError(error?: string): void {
    throw new Error(error);
  }

  public createActor = async <T>(idlFactory: InterfaceFactory, canisterId: string): Promise<ActorSubclass<T>> => {
    if (this.#authClient.getConfirm() === true && canisterId !== undefined && canisterId !== '') {
      await this._appendAuth(canisterId);
    }
    if (this.#connectOptions?.dev) {
      await this.#agent?.fetchRootKey();
    }
    return Actor.createActor<T>(idlFactory, {
      agent: this.#agent,
      canisterId,
    });
  };

  // requestTransfer
  public requestTransfer = async (options: TransactionOptions): Promise<TransactionResponseSuccess | undefined | string> => {
    const memo = options.sendOpts?.memo;
    if (memo) {
      const standard = options.standard.toUpperCase();
      if (standard === 'EXT' && !Array.isArray(memo)) {
        throw new Error('`sendOpts.memo` only supports `Array<number>` type when the standard is `EXT`');
      }
      if (standard === 'ICP' && typeof memo !== 'bigint') {
        throw new Error('`sendOpts.memo` only supports `bigint` type when the standard is `ICP`');
      }
    }
    console.assert(this.wallet !== undefined, 'wallet address is not found');
    const walletProviderUrl = new URL(options?.walletProvider?.toString() || this.#walletProvider || WALLET_PROVIDER_DEFAULT);
    walletProviderUrl.hash = WALLET_PROVIDER_ENDPOINT;
    this._openWindow(walletProviderUrl.toString(), 'icWindow', this.#useFrame ? FRAME_SETTING_PAYMENT : undefined);

    return new Promise((resolve, reject) => {
      this._eventHandler = this._getEventHandler(walletProviderUrl, resolve, reject, options);
      window.addEventListener('message', this._eventHandler);
    });
  };

  public signMessage = async (options: SignerOptions): Promise<SignerResponseSuccess | undefined | string> => {
    console.assert(this.wallet !== undefined, 'wallet address is not found');
    const signerProviderUrl = new URL(options?.signerProvider?.toString() || this.#signerProvider || SIGNER_PROVIDER_DEFAULT);
    signerProviderUrl.hash = SIGNER_PROVIDER_ENDPOINT;
    this._openWindow(signerProviderUrl.toString(), 'icWindow', this.#useFrame ? FRAME_SETTING_PAYMENT : undefined);
    return new Promise((resolve, reject) => {
      this._eventHandler = this._getSignerHandler(signerProviderUrl, resolve, reject, options);
      window.addEventListener('message', this._eventHandler);
    });
  };

  private _getSignerHandler(
    walletProviderUrl: URL,
    resolve: (value: any) => void,
    reject: (reason?: any) => void,
    options: SignerOptions,
  ): EventHandler {
    return async (event: MessageEvent) => {
      if (event.origin !== walletProviderUrl.origin) {
        return;
      }

      const message = event.data as SignerResponseMessage;

      switch (message.kind) {
        case SignerMessageKind.ready: {
          // IDP is ready. Send a message to request authorization.
          const request: { kind: SignerMessageKind } & SignerOptions = {
            kind: SignerMessageKind.client,
            from: options.from ?? this.wallet!.accountId,
            message: options.message,
            maxTimeout: options.maxTimeout ?? 90,
            successTimeout: options.successTimeout ?? 10,
          };
          this._window?.postMessage(request, walletProviderUrl.origin);
          break;
        }
        case SignerMessageKind.success:
          // Create the delegation chain and store it.
          try {
            resolve(this._handleSuccess(message, options.onSuccess, options.successTimeout ?? 10));
          } catch (err) {
            reject(this._handleFailure((err as Error).message, options.onError));
          }
          break;
        case SignerMessageKind.fail:
          reject(this._handleFailure((message as unknown as SignerResponseFailure).text, options.onError));
          break;
        default:
          break;
      }
    };
  }

  private _getEventHandler(
    walletProviderUrl: URL,
    resolve: (value: any) => void,
    reject: (reason?: any) => void,
    options: TransactionOptions,
  ): EventHandler {
    return async (event: MessageEvent) => {
      if (event.origin !== walletProviderUrl.origin) {
        return;
      }

      const message = event.data as TransactionResponseMessage;

      switch (message.kind) {
        case TransactionMessageKind.ready: {
          // IDP is ready. Send a message to request authorization.
          const request: { kind: TransactionMessageKind } & { sendData: TransactionOptions } = {
            kind: TransactionMessageKind.client,
            sendData: {
              ...options,
            },
          };
          this._window?.postMessage(request, walletProviderUrl.origin);
          break;
        }
        case TransactionMessageKind.success:
          // Create the delegation chain and store it.
          try {
            resolve(this._handleSuccess(message, options.onSuccess, options.successTimeout ?? 10));
          } catch (err) {
            reject(this._handleFailure((err as Error).message, options.onError));
          }
          break;
        case TransactionMessageKind.fail:
          reject(this._handleFailure((message as unknown as TransactionResponseFailure).text, options.onError));
          break;
        default:
          break;
      }
    };
  }

  private _handleFailure(errorMessage?: string, onError?: (error?: string) => void): string | undefined {
    this._remove();
    onError?.(errorMessage);
    return errorMessage;
  }

  private _handleSuccess(
    value?: TransactionResponseSuccess | SignerResponseSuccess,
    onSuccess?: (value?: TransactionResponseSuccess | SignerResponseSuccess) => void,
    delay?: number,
  ): TransactionResponseSuccess | SignerResponseSuccess | undefined {
    if (delay) {
      setTimeout(() => this._remove(), delay * 1000);
    } else {
      this._remove();
    }

    onSuccess?.(value);
    return value;
  }
}
