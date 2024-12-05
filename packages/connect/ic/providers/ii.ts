import type { Identity } from '@dfinity/agent';
import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { IDL } from '@dfinity/candid';
import { err, ok } from 'neverthrow';
import dfinityLogoLight from './svg/dfinity.min.svg';
import dfinityLogoDark from './svg/dfinity.min.svg';
import {
    ConnectError,
    CreateActorError,
    DisconnectError,
    iiDerivationOrigin,
    InitError,
} from './types';

// Get the pop -up size of II
export const getIIFrame = (): string => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const w = 768;
    const h = 630;
    const left = Math.floor((width - w) / 2);
    const top = Math.floor((height - h) / 2);
    return `toolbar=0,location=0,menubar=0,width=${w},height=${h},left=${left},top=${top}`;
};

// Set type
type InternetIdentityConfig = {
    whitelist: Array<string>;
    host: string;
    providerUrl: string;
    dev: boolean;
    derivationOrigin?: string;
    windowOpenerFeatures?: string;
};

// Custom II login object
export class CustomInternetIdentity {
    public meta = {
        features: [],
        icon: {
            light: dfinityLogoLight,
            dark: dfinityLogoDark,
        },
        id: 'ii',
        name: 'Internet Identity',
    };

    _config: InternetIdentityConfig;
    _identity?: Identity;
    _principal?: string;
    _client?: AuthClient;

    get principal(): string | undefined {
        return this._principal;
    }

    get client(): AuthClient | undefined {
        return this._client;
    }

    constructor(
        userConfig: {
            whitelist?: string[];
            host?: string;
            providerUrl?: string;
            dev?: boolean;
            derivationOrigin?: string;
            windowOpenerFeatures?: string;
        } = {},
    ) {
        this._config = {
            whitelist: [],
            host: window.location.origin,
            providerUrl: 'https://identity.ic0.app',
            dev: true,
            derivationOrigin: iiDerivationOrigin,
            ...userConfig,
        };
    }

    set config(config: InternetIdentityConfig) {
        this._config = { ...this._config, ...config };
    }

    get config(): InternetIdentityConfig {
        return this._config;
    }

    // initialization
    async init() {
        try {
            this._client = await AuthClient.create({
                idleOptions: { disableDefaultIdleCallback: true },
            });
            const isConnected = await this.isConnected();
            if (isConnected) {
                this._identity = this._client.getIdentity(); // The identity of the login obtained
                this._principal = this._identity?.getPrincipal().toString();
            }
            return ok({ isConnected });
        } catch (e) {
            console.error(e);
            return err({ kind: InitError.InitFailed });
        }
    }

    // Whether to log in
    async isConnected(): Promise<boolean> {
        try {
            if (!this._client) return false;
            return await this._client.isAuthenticated(); // Are you linking?
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    // Create ACTOR
    async createActor<Service>(canisterId: string, idlFactory: IDL.InterfaceFactory) {
        try {
            // TO DO: pass identity?
            const agent = HttpAgent.createSync({
                host: 'https://icp-api.io',
                // ...this._config,
                identity: this._identity, // Create Agent with your identity
                retryTimes: 1,
                // verifyQuerySignatures: false,
            });

            if (this._config.dev) {
                // Fetch root key for certificate validation during development
                const res = await agent
                    .fetchRootKey()
                    .then(() => ok(true))
                    .catch(() => err({ kind: CreateActorError.FetchRootKeyFailed }));
                if (res.isErr()) {
                    return res;
                }
            }
            // TO DO: add actorOptions?
            const actor = Actor.createActor<Service>(idlFactory, {
                agent,
                canisterId,
            });
            return ok(actor);
        } catch (e) {
            console.error(e);
            return err({ kind: CreateActorError.CreateActorFailed });
        }
    }

    // connect
    async connect() {
        try {
            await new Promise<void>((resolve, reject) => {
                this._client?.login({
                    // TO DO: local
                    // identityProvider: this._config.providerUrl,
                    onSuccess: resolve,
                    onError: (e) => {
                        // message.error(`connection failed`); // Reminder if you log in failure
                        reject(e);
                    },
                    windowOpenerFeatures: this._config.windowOpenerFeatures
                        ? this._config.windowOpenerFeatures
                        : window.innerWidth < 768
                          ? undefined
                          : getIIFrame(),
                    derivationOrigin: this._config.derivationOrigin,
                    maxTimeToLive: BigInt(7 * 24 * 3600 * 1000 * 1000 * 1000),
                });
            });
            const identity = this._client?.getIdentity();
            const principal = identity?.getPrincipal().toString();
            this._identity = identity;
            this._principal = principal;
            return ok(true);
        } catch (e) {
            console.error(e);
            return err({ kind: ConnectError.ConnectFailed });
        }
    }

    // disconnect
    async disconnect() {
        try {
            await this._client?.logout();
            return ok(true);
        } catch (e) {
            console.error(e);
            return err({ kind: DisconnectError.DisconnectFailed });
        }
    }
}
