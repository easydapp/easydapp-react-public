import { AnonymousIdentity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { Delegation, DelegationChain, DelegationIdentity, Ed25519KeyIdentity, isDelegationValid } from "@dfinity/identity";
import { PermissionsType } from "../types";
import { IDENTITY_PROVIDER_DEFAULT, IDENTITY_PROVIDER_ENDPOINT, KEY_ICSTORAGE_DELEGATION, KEY_ICSTORAGE_KEY, KEY_ICSTORAGE_WALLET, ICStorage, _deleteStorage, KEY_DELEGATION_PARAMS } from "./icStorage";
export class AuthClient {
    _identity;
    _key;
    _chain;
    _storage;
    _wallet;
    _appId;
    _delegationIdentity;
    _delegationTargets;
    _lastRequest;
    _confirm;
    _idpWindowOption;
    _idpWindow;
    _eventHandler;
    static async create(options = {
        appId: ''
    }) {
        const storage = options.storage ?? new ICStorage('astrox-');
        let key = null;
        if (options.identity) {
            key = options.identity;
        } else {
            const maybeIdentityStorage = await storage.get(KEY_ICSTORAGE_KEY);
            if (maybeIdentityStorage) {
                try {
                    key = Ed25519KeyIdentity.fromJSON(maybeIdentityStorage);
                } catch (e) {}
            }
        }
        let identity = new AnonymousIdentity();
        let chain = null;
        let wallet = undefined;
        let delegationTargets = [];
        let lastRequest = undefined;
        let confirm = true;
        let delegationIdentity = undefined;
        if (key) {
            try {
                const chainStorage = await storage.get(KEY_ICSTORAGE_DELEGATION);
                let walletString = await storage.get(KEY_ICSTORAGE_WALLET);
                if (walletString) {
                    wallet = JSON.parse(walletString);
                }
                if (chainStorage) {
                    chain = DelegationChain.fromJSON(chainStorage);
                    chain.delegations.forEach((signedDelegation)=>{
                        const targets = signedDelegation.delegation.targets && signedDelegation.delegation.targets.length > 0 ? signedDelegation.delegation.targets : undefined;
                        if (targets) {
                            delegationTargets = [
                                ...new Set(delegationTargets.concat(targets.map((e)=>e.toText())))
                            ];
                        }
                    });
                    if (!isDelegationValid(chain)) {
                        await _deleteStorage(storage);
                        key = null;
                    } else {
                        identity = DelegationIdentity.fromDelegation(key, chain);
                    }
                }
            } catch (e) {
                console.error(e);
                await _deleteStorage(storage);
                key = null;
            }
        }
        let delegationParams;
        const delegationParamsString = await storage.get(KEY_DELEGATION_PARAMS);
        if (delegationParamsString) {
            delegationParams = JSON.parse(delegationParamsString);
            lastRequest = {
                ...delegationParams.lastRequest,
                maxTimeToLive: delegationParams.lastRequest.maxTimeToLive !== undefined ? BigInt(delegationParams.lastRequest.maxTimeToLive) : undefined
            };
            confirm = delegationParams.confirm;
            delegationIdentity = DelegationIdentity.fromDelegation(key, chain);
        }
        const ret = new this(identity, key, chain, storage, wallet, options.appId, delegationIdentity, delegationTargets, lastRequest, confirm, options.idpWindowOption);
        return ret;
    }
    constructor(_identity, _key, _chain, _storage, _wallet, _appId, _delegationIdentity, _delegationTargets = [], _lastRequest, _confirm, _idpWindowOption, _idpWindow, _eventHandler){
        this._identity = _identity;
        this._key = _key;
        this._chain = _chain;
        this._storage = _storage;
        this._wallet = _wallet;
        this._appId = _appId;
        this._delegationIdentity = _delegationIdentity;
        this._delegationTargets = _delegationTargets;
        this._lastRequest = _lastRequest;
        this._confirm = _confirm;
        this._idpWindowOption = _idpWindowOption;
        this._idpWindow = _idpWindow;
        this._eventHandler = _eventHandler;
    }
    async _handleSuccess(message, onSuccess) {
        if (message['identity'] !== undefined) {
            const idDelegations = message['identity'].delegations.map((signedDelegation)=>{
                const targets = signedDelegation.delegation.targets && signedDelegation.delegation.targets.length > 0 ? signedDelegation.delegation.targets?.map((t)=>Principal.fromText(t)) : undefined;
                if (targets) {
                    this._delegationTargets = [
                        ...new Set(this._delegationTargets.concat(targets.map((e)=>e.toText())))
                    ];
                }
                return {
                    delegation: new Delegation(signedDelegation.delegation.pubkey.buffer, signedDelegation.delegation.expiration, targets),
                    signature: signedDelegation.signature.buffer
                };
            });
            const idDelegationChain = DelegationChain.fromDelegations(idDelegations, message['identity'].userPublicKey.buffer);
            this._chain = idDelegationChain;
            this._wallet = message['wallet'];
            this._confirm = message['confirm'];
        } else {
            const iiDelegations = message.delegations.map((signedDelegation)=>{
                const targets = signedDelegation.delegation.targets && signedDelegation.delegation.targets.length > 0 ? signedDelegation.delegation.targets?.map((t)=>Principal.fromText(t)) : undefined;
                if (targets) {
                    this._delegationTargets = [
                        ...new Set(this._delegationTargets.concat(targets.map((e)=>e.toText())))
                    ];
                }
                return {
                    delegation: new Delegation(signedDelegation.delegation.pubkey.buffer, signedDelegation.delegation.expiration, targets),
                    signature: signedDelegation.signature.buffer
                };
            });
            const iiDelegationChain = DelegationChain.fromDelegations(iiDelegations, message.userPublicKey.buffer);
            this._chain = iiDelegationChain;
        }
        const key = this._key;
        if (!key) {
            return this;
        }
        this._delegationIdentity = DelegationIdentity.fromDelegation(key, this._chain);
        this._identity = this._delegationIdentity;
        this._idpWindow?.close();
        await onSuccess?.();
        this._removeEventListener();
        return this;
    }
    getIdentity() {
        return this._identity;
    }
    getLastRequest() {
        return this._lastRequest;
    }
    getDelegationIdentity() {
        return this._delegationIdentity;
    }
    getInnerKey() {
        return this._key;
    }
    getDelegationChain() {
        return this._chain;
    }
    get wallet() {
        return this._wallet;
    }
    getConfirm() {
        return this._confirm;
    }
    setWallet(data) {
        this._wallet = data;
    }
    getDelegateTargets() {
        return this._delegationTargets;
    }
    setDelegationTargets(targets) {
        this._delegationTargets = [
            ...new Set(this._delegationTargets.concat(targets))
        ];
    }
    async isAuthenticated() {
        return !this.getIdentity().getPrincipal().isAnonymous() && this._chain !== null;
    }
    async login(options) {
        let key = this._key;
        if (!key) {
            key = Ed25519KeyIdentity.generate();
            this._key = key;
            await this._storage.set(KEY_ICSTORAGE_KEY, JSON.stringify(key));
        }
        const identityProviderUrl = new URL(options?.identityProvider?.toString() || IDENTITY_PROVIDER_DEFAULT);
        identityProviderUrl.hash = IDENTITY_PROVIDER_ENDPOINT;
        this._idpWindow?.close();
        this._removeEventListener();
        this._idpWindow = window.open(identityProviderUrl.toString(), 'idpWindow', this._idpWindowOption) ?? undefined;
        return new Promise((resolve, reject)=>{
            this._eventHandler = this._getEventHandler(identityProviderUrl, resolve, reject, options);
            window.addEventListener('message', this._eventHandler);
        });
    }
    _getEventHandler(identityProviderUrl, resolve, reject, options) {
        return async (event)=>{
            if (event.origin !== identityProviderUrl.origin) {
                return;
            }
            const message = event.data;
            switch(message.kind){
                case 'authorize-ready':
                    {
                        const request = options?.authType === 'authorize-append' && this._lastRequest ? {
                            ...this._lastRequest,
                            delegationTargets: options?.delegationTargets ?? [],
                            sessionPublicKey: new Uint8Array(this._key?.getPublicKey().toDer()),
                            kind: 'authorize-append'
                        } : {
                            kind: 'authorize-client',
                            sessionPublicKey: new Uint8Array(this._key?.getPublicKey().toDer()),
                            maxTimeToLive: options?.maxTimeToLive,
                            permissions: options?.permissions ?? [
                                PermissionsType.identity
                            ],
                            delegationTargets: options?.delegationTargets ?? [],
                            delegationModes: options?.delegationModes,
                            appId: this._appId,
                            noUnify: options?.noUnify,
                            host: options?.customDomain || options?.host
                        };
                        this._lastRequest = request;
                        this._idpWindow?.postMessage(request, identityProviderUrl.origin);
                        break;
                    }
                case 'authorize-client-success':
                    try {
                        resolve(await this._handleSuccess(message, options?.onSuccess));
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
                                    maxTimeToLive: this._lastRequest.maxTimeToLive?.toString()
                                },
                                confirm: this._confirm
                            };
                            await this._storage.set(KEY_DELEGATION_PARAMS, JSON.stringify(params));
                        }
                    } catch (err) {
                        reject(this._handleFailure(err.message, options?.onError));
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
    _handleFailure(errorMessage, onError) {
        this._idpWindow?.close();
        onError?.(errorMessage);
        this._removeEventListener();
        return errorMessage;
    }
    _removeEventListener() {
        if (this._eventHandler) {
            window.removeEventListener('message', this._eventHandler);
        }
        this._eventHandler = undefined;
    }
    async logout(options = {}) {
        _deleteStorage(this._storage);
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

//# sourceMappingURL=icAuthClient.js.map