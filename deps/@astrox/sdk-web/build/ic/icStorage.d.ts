import { AbstractedClientStorage } from '@astrox/sdk-core';
export declare const KEY_ICSTORAGE_KEY = "identity";
export declare const KEY_ICSTORAGE_DELEGATION = "delegation";
export declare const KEY_ICSTORAGE_WALLET = "wallet";
export declare const KEY_DELEGATION_PARAMS = "delegation_params";
export declare const IDENTITY_PROVIDER_DEFAULT = "https://identity.ic0.app";
export declare const IDENTITY_PROVIDER_ENDPOINT = "#authorize";
export declare function _deleteStorage(storage: AbstractedClientStorage): Promise<void>;
export declare class ICStorage implements AbstractedClientStorage {
    readonly prefix: string;
    private readonly _localStorage?;
    constructor(prefix?: string, _localStorage?: Storage | undefined);
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<void>;
    remove(key: string): Promise<void>;
    private _getICStorage;
}
