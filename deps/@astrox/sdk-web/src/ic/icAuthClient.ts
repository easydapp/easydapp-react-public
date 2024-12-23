/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { AnonymousIdentity, DerEncodedPublicKey, Identity, Signature, SignIdentity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { Delegation, DelegationChain, DelegationIdentity, Ed25519KeyIdentity, isDelegationValid } from '@dfinity/identity';
import {
  AuthClientCreateOptions,
  AuthClientLoginOptions,
  AuthRequestJSON,
  AuthResponseSuccess,
  DelegationResult,
  EventHandler,
  IdentityServiceResponseMessage,
  InternetIdentityAuthRequest,
  MeAuthResponseSuccess,
  PermissionsType,
} from '../types';
import {
  IDENTITY_PROVIDER_DEFAULT,
  IDENTITY_PROVIDER_ENDPOINT,
  KEY_ICSTORAGE_DELEGATION,
  KEY_ICSTORAGE_KEY,
  KEY_ICSTORAGE_WALLET,
  ICStorage,
  _deleteStorage,
  KEY_DELEGATION_PARAMS,
} from './icStorage';
import { Wallet } from '@astrox/sdk-core';

import { AbstractedClientStorage } from '@astrox/sdk-core';

export class AuthClient {
  public static async create(
    options: AuthClientCreateOptions = {
      appId: '',
    },
  ): Promise<AuthClient> {
    const storage = options.storage ?? new ICStorage('astrox-');

    let key: null | SignIdentity = null;
    if (options.identity) {
      key = options.identity;
    } else {
      const maybeIdentityStorage = await storage.get(KEY_ICSTORAGE_KEY);

      if (maybeIdentityStorage) {
        try {
          key = Ed25519KeyIdentity.fromJSON(maybeIdentityStorage);
        } catch (e) {
          // Ignore this, this means that the ICStorage value isn't a valid Ed25519KeyIdentity
          // serialization.
        }
      }
    }

    let identity = new AnonymousIdentity();
    let chain: null | DelegationChain = null;
    let wallet: Wallet | undefined = undefined;
    let delegationTargets: string[] = [];
    let lastRequest: InternetIdentityAuthRequest | undefined = undefined;
    let confirm = true;
    let delegationIdentity: DelegationIdentity | undefined = undefined;
    if (key) {
      try {
        const chainStorage = await storage.get(KEY_ICSTORAGE_DELEGATION);
        let walletString = await storage.get(KEY_ICSTORAGE_WALLET);
        if (walletString) {
          wallet = JSON.parse(walletString);
        }
        if (chainStorage) {
          chain = DelegationChain.fromJSON(chainStorage);
          chain.delegations.forEach(signedDelegation => {
            const targets =
              signedDelegation.delegation.targets && signedDelegation.delegation.targets.length > 0 ? signedDelegation.delegation.targets : undefined;
            if (targets) {
              delegationTargets = [...new Set(delegationTargets.concat(targets.map(e => e.toText())))];
            }
          });
          // Verify that the delegation isn't expired.
          if (!isDelegationValid(chain)) {
            await _deleteStorage(storage);
            key = null;
          } else {
            identity = DelegationIdentity.fromDelegation(key, chain);
          }
        }
      } catch (e) {
        console.error(e);
        // If there was a problem loading the chain, delete the key.
        await _deleteStorage(storage);
        key = null;
      }
    }
    let delegationParams: AuthRequestJSON | undefined;
    const delegationParamsString = await storage.get(KEY_DELEGATION_PARAMS);
    if (delegationParamsString) {
      delegationParams = JSON.parse(delegationParamsString) as AuthRequestJSON;
      lastRequest = {
        ...delegationParams.lastRequest,
        maxTimeToLive: delegationParams.lastRequest.maxTimeToLive !== undefined ? BigInt(delegationParams.lastRequest.maxTimeToLive) : undefined,
      };
      confirm = delegationParams.confirm;
      delegationIdentity = DelegationIdentity.fromDelegation(key!, chain!);
    }

    const ret = new this(
      identity,
      key,
      chain,
      storage,
      wallet,
      options.appId,
      delegationIdentity,
      delegationTargets,
      lastRequest,
      confirm,
      options.idpWindowOption,
    );
    // ret.setDelegationTargets(delegationTargets);
    return ret;
  }

  protected constructor(
    private _identity: Identity,
    private _key: SignIdentity | null,
    private _chain: DelegationChain | null,
    private _storage: AbstractedClientStorage,
    private _wallet?: Wallet,
    private _appId?: string,
    private _delegationIdentity?: DelegationIdentity,
    private _delegationTargets: string[] = [],
    private _lastRequest?: InternetIdentityAuthRequest,
    private _confirm?: boolean,
    private _idpWindowOption?: string,
    // A handle on the IdP window.
    private _idpWindow?: Window,
    // The event handler for processing events from the IdP.
    private _eventHandler?: (event: MessageEvent) => void,
  ) { }

  private async _handleSuccess(message: AuthResponseSuccess, onSuccess?: () => void | Promise<void>): Promise<AuthClient> {
    // console.log(message["identity"]);
    if ((message as MeAuthResponseSuccess)['identity'] !== undefined) {
      const idDelegations = ((message as MeAuthResponseSuccess)['identity'] as DelegationResult).delegations.map(signedDelegation => {
        const targets =
          signedDelegation.delegation.targets && signedDelegation.delegation.targets.length > 0
            ? signedDelegation.delegation.targets?.map(t => Principal.fromText(t))
            : undefined;
        if (targets) {
          this._delegationTargets = [...new Set(this._delegationTargets.concat(targets.map(e => e.toText())))];
        }
        return {
          delegation: new Delegation(signedDelegation.delegation.pubkey.buffer, signedDelegation.delegation.expiration, targets),
          signature: signedDelegation.signature.buffer as Signature,
        };
      });

      const idDelegationChain = DelegationChain.fromDelegations(
        idDelegations,
        ((message as MeAuthResponseSuccess)['identity'] as DelegationResult).userPublicKey.buffer as DerEncodedPublicKey,
      );
      this._chain = idDelegationChain;
      this._wallet = (message as MeAuthResponseSuccess)['wallet'];
      this._confirm = (message as MeAuthResponseSuccess)['confirm'];
    } else {
      const iiDelegations = (message as DelegationResult).delegations.map(signedDelegation => {
        const targets =
          signedDelegation.delegation.targets && signedDelegation.delegation.targets.length > 0
            ? signedDelegation.delegation.targets?.map(t => Principal.fromText(t))
            : undefined;
        if (targets) {
          this._delegationTargets = [...new Set(this._delegationTargets.concat(targets.map(e => e.toText())))];
        }
        return {
          delegation: new Delegation(signedDelegation.delegation.pubkey.buffer, signedDelegation.delegation.expiration, targets),
          signature: signedDelegation.signature.buffer as Signature,
        };
      });

      const iiDelegationChain = DelegationChain.fromDelegations(
        iiDelegations,
        (message as DelegationResult).userPublicKey.buffer as DerEncodedPublicKey,
      );
      this._chain = iiDelegationChain;
    }

    const key = this._key;
    if (!key) {
      return this;
    }
    this._delegationIdentity = DelegationIdentity.fromDelegation(key, this._chain!);
    this._identity = this._delegationIdentity;
    this._idpWindow?.close();
    await onSuccess?.();
    this._removeEventListener();
    return this;
  }

  public getIdentity(): Identity {
    return this._identity;
  }

  public getLastRequest(): InternetIdentityAuthRequest | undefined {
    return this._lastRequest;
  }

  public getDelegationIdentity(): DelegationIdentity | undefined {
    return this._delegationIdentity;
  }

  public getInnerKey(): SignIdentity | null {
    return this._key;
  }

  public getDelegationChain(): DelegationChain | null {
    return this._chain;
  }

  public get wallet(): Wallet {
    return this._wallet!;
  }
  public getConfirm(): boolean | undefined {
    return this._confirm;
  }

  public setWallet(data: Wallet): void {
    this._wallet = data;
  }

  public getDelegateTargets(): string[] {
    return this._delegationTargets;
  }

  public setDelegationTargets(targets: string[]): void {
    this._delegationTargets = [...new Set(this._delegationTargets.concat(targets))];
  }

  public async isAuthenticated(): Promise<boolean> {
    return !this.getIdentity().getPrincipal().isAnonymous() && this._chain !== null;
  }

  public async login(options?: AuthClientLoginOptions): Promise<void> {
    let key = this._key;
    if (!key) {
      // Create a new key (whether or not one was in storage).
      key = Ed25519KeyIdentity.generate();
      this._key = key;
      await this._storage.set(KEY_ICSTORAGE_KEY, JSON.stringify(key));
    }

    // Create the URL of the IDP. (e.g. https://XXXX/#authorize)
    const identityProviderUrl = new URL(options?.identityProvider?.toString() || IDENTITY_PROVIDER_DEFAULT);
    // Set the correct hash if it isn't already set.
    identityProviderUrl.hash = IDENTITY_PROVIDER_ENDPOINT;

    // If `login` has been called previously, then close/remove any previous windows
    // and event listeners.
    this._idpWindow?.close();
    this._removeEventListener();

    // Open a new window with the IDP provider.
    this._idpWindow = window.open(identityProviderUrl.toString(), 'idpWindow', this._idpWindowOption) ?? undefined;
    // Add an event listener to handle responses.

    return new Promise((resolve, reject) => {
      this._eventHandler = this._getEventHandler(identityProviderUrl, resolve, reject, options);
      window.addEventListener('message', this._eventHandler);
    });
  }

  private _getEventHandler(
    identityProviderUrl: URL,
    resolve: (value: any) => void,
    reject: (reason?: any) => void,
    options?: AuthClientLoginOptions,
  ): EventHandler {
    return async (event: MessageEvent) => {
      if (event.origin !== identityProviderUrl.origin) {
        return;
      }

      const message = event.data as IdentityServiceResponseMessage;

      switch (message.kind) {
        case 'authorize-ready': {
          // IDP is ready. Send a message to request authorization.
          const request: InternetIdentityAuthRequest =
            options?.authType === 'authorize-append' && this._lastRequest
              ? {
                ...this._lastRequest,
                delegationTargets: options?.delegationTargets ?? [],
                sessionPublicKey: new Uint8Array(this._key?.getPublicKey().toDer()!),
                kind: 'authorize-append',
              }
              : {
                kind: 'authorize-client',
                sessionPublicKey: new Uint8Array(this._key?.getPublicKey().toDer()!),
                maxTimeToLive: options?.maxTimeToLive,
                permissions: options?.permissions ?? [PermissionsType.identity],
                delegationTargets: options?.delegationTargets ?? [],
                delegationModes: options?.delegationModes,
                appId: this._appId,
                noUnify: options?.noUnify,
                host: options?.customDomain || options?.host,
              };
          this._lastRequest = request;
          this._idpWindow?.postMessage(request, identityProviderUrl.origin);
          break;
        }
        case 'authorize-client-success':
          // Create the delegation chain and store it.
          try {
            resolve(await this._handleSuccess(message, options?.onSuccess));

            // Setting the storage is moved out of _handleSuccess to make
            // it a sync function. Having _handleSuccess as an async function
            // messes up the jest tests for some reason.
            // todo: targets tojson
            if (this._chain) {
              await this._storage.set(KEY_ICSTORAGE_DELEGATION, JSON.stringify(this._chain.toJSON()));
            }
            if (this._wallet !== undefined) {
              await this._storage.set(KEY_ICSTORAGE_WALLET, JSON.stringify(this._wallet));
            }
            if (this._lastRequest !== undefined) {
              const params = {
                lastRequest: {
                  ...this._lastRequest,
                  maxTimeToLive: this._lastRequest.maxTimeToLive?.toString(),
                },
                confirm: this._confirm,
              };
              await this._storage.set(KEY_DELEGATION_PARAMS, JSON.stringify(params));
            }
          } catch (err) {
            reject(this._handleFailure((err as Error).message, options?.onError));
          }
          break;
        case 'authorize-client-failure':
          reject(this._handleFailure(message.text, options?.onError));
          break;
        default:
          break;
      }
    };
  }

  private _handleFailure(errorMessage?: string, onError?: (error?: string) => void): string | undefined {
    this._idpWindow?.close();
    onError?.(errorMessage);
    this._removeEventListener();
    return errorMessage;
  }

  private _removeEventListener() {
    if (this._eventHandler) {
      window.removeEventListener('message', this._eventHandler);
    }
    this._eventHandler = undefined;
  }

  public async logout(options: { returnTo?: string } = {}): Promise<void> {
    _deleteStorage(this._storage);

    // Reset this auth client to a non-authenticated state.
    this._identity = new AnonymousIdentity();
    this._key = null;
    this._chain = null;
    this._delegationTargets = [];
    this._wallet = undefined;
    this._delegationIdentity = undefined;
    this._lastRequest = undefined;
    this._confirm = undefined;

    if (options.returnTo) {
      try {
        window.history.pushState({}, '', options.returnTo);
      } catch (e) {
        window.location.href = options.returnTo;
      }
    }
  }
}

//
