import { Actor, HttpAgent } from "@dfinity/agent";
import { AuthClient } from "./icAuthClient";
import { IDENTITY_PROVIDER_DEFAULT } from "./icStorage";
import { ICWindow } from "./icWindow";
import { LedgerConnection } from "../connections/ledgerConnection";
import { PermissionsType, SignerMessageKind, TransactionMessageKind } from "../types";
const days = BigInt(1);
const hours = BigInt(24);
const nanoseconds = BigInt(3600000000000);
const WALLET_PROVIDER_DEFAULT = 'https://63k2f-nyaaa-aaaah-aakla-cai.raw.ic0.app';
const WALLET_PROVIDER_ENDPOINT = '#transaction';
const SIGNER_PROVIDER_DEFAULT = 'https://63k2f-nyaaa-aaaah-aakla-cai.raw.ic0.app';
const SIGNER_PROVIDER_ENDPOINT = '#signer';
function targetsFilter(arr) {
    return arr.filter((value)=>typeof value === 'string' && value.trim());
}
const FRAME_SETTING = 'height=600, width=800, top=0, right=0, toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no';
const FRAME_SETTING_PAYMENT = 'height=600, width=480, top=0, right=0, toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no';
export class IC extends ICWindow {
    #authClient;
    #agent;
    #localLedger;
    #walletProvider;
    #signerProvider;
    #useFrame = false;
    #loginOption;
    #connectOptions;
    constructor(authClient, agent){
        super();
        this.#authClient = authClient;
        this.#agent = agent;
        this.injectWindow();
    }
    static async create(config) {
        let delegationTargets = [
            'ryjl3-tyaaa-aaaaa-aaaba-cai'
        ];
        if (config && config?.delegationTargets) {
            delegationTargets = [
                ...new Set(delegationTargets.concat(config?.delegationTargets))
            ];
        }
        if (config && config?.ledgerCanisterId) {
            delegationTargets = [
                ...new Set(delegationTargets.concat(config?.ledgerCanisterId))
            ];
        }
        if (config && config?.whitelist) {
            delegationTargets = [
                ...new Set(delegationTargets.concat(config?.whitelist))
            ];
        }
        delegationTargets = targetsFilter([
            ...new Set(delegationTargets)
        ]);
        const authClient = await AuthClient.create({
            ...config,
            delegationTargets,
            idpWindowOption: config.useFrame === true ? FRAME_SETTING : undefined
        });
        const identity = authClient.getIdentity();
        const agent = new HttpAgent({
            identity,
            host: config.host ?? window.location.origin
        });
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
                ledgerHost: config.ledgerHost ?? 'https://boundary.ic0.app/'
            });
            await config?.onAuthenticated?.(newIC);
        }
        const provider = config?.identityProvider ?? IDENTITY_PROVIDER_DEFAULT;
        newIC._setConnectOptions({
            ...config,
            dev: config.dev,
            delegationTargets
        });
        newIC._setLoginOptions({
            ...config,
            identityProvider: provider,
            maxTimeToLive: config?.maxTimeToLive ?? days * hours * nanoseconds,
            permissions: config?.permissions ?? [
                PermissionsType.identity
            ],
            delegationTargets
        });
        return newIC;
    }
    async connect(connectOptions) {
        let delegationModes = connectOptions.delegationModes;
        if (delegationModes && delegationModes.length) {
            const modes = [
                'global',
                'domain'
            ];
            const hasNotInclude = delegationModes.some((v)=>!modes.includes(v));
            if (hasNotInclude) {
                throw new Error('`delegationModes` elements only support `global` and `private`');
            }
            delegationModes = [
                ...new Set(delegationModes)
            ];
        }
        const provider = connectOptions?.identityProvider ?? IDENTITY_PROVIDER_DEFAULT;
        let delegationTargets = [
            'ryjl3-tyaaa-aaaaa-aaaba-cai'
        ];
        if (connectOptions && connectOptions?.delegationTargets) {
            delegationTargets = [
                ...new Set(delegationTargets.concat(connectOptions?.delegationTargets))
            ];
        }
        if (connectOptions && connectOptions?.ledgerCanisterId) {
            delegationTargets = [
                ...new Set(delegationTargets.concat(connectOptions?.ledgerCanisterId))
            ];
        }
        if (connectOptions && connectOptions?.whitelist) {
            delegationTargets = [
                ...new Set(delegationTargets.concat(connectOptions?.whitelist))
            ];
        }
        delegationTargets = targetsFilter([
            ...new Set(delegationTargets)
        ]);
        this._setConnectOptions({
            ...connectOptions,
            delegationTargets
        });
        this._setLoginOptions({
            ...connectOptions,
            identityProvider: provider,
            maxTimeToLive: connectOptions?.maxTimeToLive ?? days * hours * nanoseconds,
            permissions: connectOptions?.permissions ?? [
                PermissionsType.identity
            ],
            delegationTargets,
            delegationModes
        });
        await new Promise((resolve, reject)=>{
            this.getAuthClient().login({
                ...this.#loginOption,
                onSuccess: async ()=>{
                    const identity = this.getAuthClient().getIdentity();
                    this.#agent = new HttpAgent({
                        identity,
                        host: connectOptions.host ?? window.location.origin
                    });
                    if (connectOptions.dev) {
                        await this.#agent.fetchRootKey();
                    }
                    await this.handleAuthenticated({
                        ledgerCanisterId: connectOptions.ledgerCanisterId,
                        ledgerHost: connectOptions.ledgerHost ?? 'https://boundary.ic0.app/'
                    });
                    connectOptions?.onSuccess ? await connectOptions?.onSuccess?.() : await connectOptions?.onAuthenticated?.(this);
                    resolve(this);
                },
                onError: this.handleError
            });
        });
        return this;
    }
    async isAuthenticated() {
        const result = await this.#authClient.isAuthenticated();
        return result;
    }
    get identity() {
        return this.#authClient.getIdentity();
    }
    get principal() {
        return this.identity.getPrincipal();
    }
    get wallet() {
        return this.#authClient.wallet;
    }
    get delegationTargets() {
        return this.#authClient.getDelegateTargets();
    }
    _setWalletProvider(provider) {
        this.#walletProvider = provider;
    }
    _setSignerProvider(provider) {
        this.#signerProvider = provider;
    }
    _setUseFrame(useFrame) {
        this.#useFrame = useFrame;
    }
    _setConnectOptions(options) {
        this.#connectOptions = options;
    }
    _setLoginOptions(options) {
        this.#loginOption = options;
    }
    get loginOption() {
        return this.#loginOption;
    }
    get connectOptions() {
        return this.#connectOptions;
    }
    getAuthClient() {
        return this.#authClient;
    }
    disconnect = async (options = {})=>{
        this.#agent = undefined;
        this.#localLedger = undefined;
        this.#walletProvider = undefined;
        this.#signerProvider = undefined;
        this.#loginOption = undefined;
        this.#connectOptions = undefined;
        await this.getAuthClient().logout(options);
    };
    queryBalance = async ()=>{
        if (this.wallet === undefined) {
            throw Error('Wallet address is not found');
        }
        if (this.#localLedger === undefined) {
            throw Error('Ledger connection failed');
        }
        const result = await this.#localLedger?.getBalance(this.wallet.accountId);
        return result;
    };
    handleAuthenticated = async ({ ledgerCanisterId, ledgerHost })=>{
        const actorResult = await LedgerConnection.createActor(this.getAuthClient().getDelegationIdentity(), ledgerCanisterId, ledgerHost);
        this.#localLedger = LedgerConnection.createConnection(this.getAuthClient().getInnerKey(), this.getAuthClient().getDelegationIdentity(), ledgerCanisterId, actorResult.actor, this.#agent);
    };
    injectWindow() {
        if (window.ic !== undefined) {
            window.ic.astrox = this;
        } else {
            window.ic = {
                astrox: this
            };
        }
    }
    async _appendAuth(canisterId) {
        const currentTargets = targetsFilter(this.#authClient.getDelegateTargets());
        if (currentTargets.includes(canisterId)) {
            return this;
        } else {
            let newTargets = [
                ...currentTargets,
                canisterId
            ];
            newTargets = targetsFilter(newTargets);
            this._setConnectOptions({
                ...this.#connectOptions,
                delegationTargets: newTargets
            });
            this._setLoginOptions({
                ...this.#loginOption,
                delegationTargets: newTargets
            });
            return await new Promise((resolve, reject)=>{
                this.getAuthClient().login({
                    ...this.#loginOption,
                    authType: 'authorize-append',
                    delegationTargets: newTargets,
                    onSuccess: async ()=>{
                        const identity = this.getAuthClient().getIdentity();
                        this.#agent = new HttpAgent({
                            identity,
                            host: this.#connectOptions !== undefined ? this.#connectOptions.host : window.location.origin
                        });
                        if (this.#connectOptions?.dev) {
                            await this.#agent.fetchRootKey();
                        }
                        await this.handleAuthenticated({
                            ledgerCanisterId: this.#connectOptions?.ledgerCanisterId,
                            ledgerHost: this.#connectOptions?.ledgerHost ?? 'https://boundary.ic0.app/'
                        });
                        await this.#connectOptions?.onSuccess ? await this.#connectOptions?.onSuccess?.() : await this.#connectOptions?.onAuthenticated?.(this);
                        resolve(this);
                    },
                    onError: this.handleError
                });
            });
        }
    }
    handleError(error) {
        throw new Error(error);
    }
    createActor = async (idlFactory, canisterId)=>{
        if (this.#authClient.getConfirm() === true && canisterId !== undefined && canisterId !== '') {
            await this._appendAuth(canisterId);
        }
        if (this.#connectOptions?.dev) {
            await this.#agent?.fetchRootKey();
        }
        return Actor.createActor(idlFactory, {
            agent: this.#agent,
            canisterId
        });
    };
    requestTransfer = async (options)=>{
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
        return new Promise((resolve, reject)=>{
            this._eventHandler = this._getEventHandler(walletProviderUrl, resolve, reject, options);
            window.addEventListener('message', this._eventHandler);
        });
    };
    signMessage = async (options)=>{
        console.assert(this.wallet !== undefined, 'wallet address is not found');
        const signerProviderUrl = new URL(options?.signerProvider?.toString() || this.#signerProvider || SIGNER_PROVIDER_DEFAULT);
        signerProviderUrl.hash = SIGNER_PROVIDER_ENDPOINT;
        this._openWindow(signerProviderUrl.toString(), 'icWindow', this.#useFrame ? FRAME_SETTING_PAYMENT : undefined);
        return new Promise((resolve, reject)=>{
            this._eventHandler = this._getSignerHandler(signerProviderUrl, resolve, reject, options);
            window.addEventListener('message', this._eventHandler);
        });
    };
    _getSignerHandler(walletProviderUrl, resolve, reject, options) {
        return async (event)=>{
            if (event.origin !== walletProviderUrl.origin) {
                return;
            }
            const message = event.data;
            switch(message.kind){
                case SignerMessageKind.ready:
                    {
                        const request = {
                            kind: SignerMessageKind.client,
                            from: options.from ?? this.wallet.accountId,
                            message: options.message,
                            maxTimeout: options.maxTimeout ?? 90,
                            successTimeout: options.successTimeout ?? 10
                        };
                        this._window?.postMessage(request, walletProviderUrl.origin);
                        break;
                    }
                case SignerMessageKind.success:
                    try {
                        resolve(this._handleSuccess(message, options.onSuccess, options.successTimeout ?? 10));
                    } catch (err) {
                        reject(this._handleFailure(err.message, options.onError));
                    }
                    break;
                case SignerMessageKind.fail:
                    reject(this._handleFailure(message.text, options.onError));
                    break;
                default:
                    break;
            }
        };
    }
    _getEventHandler(walletProviderUrl, resolve, reject, options) {
        return async (event)=>{
            if (event.origin !== walletProviderUrl.origin) {
                return;
            }
            const message = event.data;
            switch(message.kind){
                case TransactionMessageKind.ready:
                    {
                        const request = {
                            kind: TransactionMessageKind.client,
                            sendData: {
                                ...options
                            }
                        };
                        this._window?.postMessage(request, walletProviderUrl.origin);
                        break;
                    }
                case TransactionMessageKind.success:
                    try {
                        resolve(this._handleSuccess(message, options.onSuccess, options.successTimeout ?? 10));
                    } catch (err) {
                        reject(this._handleFailure(err.message, options.onError));
                    }
                    break;
                case TransactionMessageKind.fail:
                    reject(this._handleFailure(message.text, options.onError));
                    break;
                default:
                    break;
            }
        };
    }
    _handleFailure(errorMessage, onError) {
        this._remove();
        onError?.(errorMessage);
        return errorMessage;
    }
    _handleSuccess(value, onSuccess, delay) {
        if (delay) {
            setTimeout(()=>this._remove(), delay * 1000);
        } else {
            this._remove();
        }
        onSuccess?.(value);
        return value;
    }
}

//# sourceMappingURL=icConnect.js.map