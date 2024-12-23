export const KEY_ICSTORAGE_KEY = 'identity';
export const KEY_ICSTORAGE_DELEGATION = 'delegation';
export const KEY_ICSTORAGE_WALLET = 'wallet';
export const KEY_DELEGATION_PARAMS = 'delegation_params';
export const IDENTITY_PROVIDER_DEFAULT = 'https://identity.ic0.app';
export const IDENTITY_PROVIDER_ENDPOINT = '#authorize';
export async function _deleteStorage(storage) {
    await storage.remove(KEY_ICSTORAGE_KEY);
    await storage.remove(KEY_ICSTORAGE_DELEGATION);
    await storage.remove(KEY_ICSTORAGE_WALLET);
    await storage.remove(KEY_DELEGATION_PARAMS);
}
export class ICStorage {
    prefix;
    _localStorage;
    constructor(prefix = 'astrox-', _localStorage){
        this.prefix = prefix;
        this._localStorage = _localStorage;
    }
    get(key) {
        return Promise.resolve(this._getICStorage().getItem(this.prefix + key));
    }
    set(key, value) {
        this._getICStorage().setItem(this.prefix + key, value);
        return Promise.resolve();
    }
    remove(key) {
        this._getICStorage().removeItem(this.prefix + key);
        return Promise.resolve();
    }
    _getICStorage() {
        if (this._localStorage) {
            return this._localStorage;
        }
        const ls = typeof window === 'undefined' ? typeof global === 'undefined' ? typeof self === 'undefined' ? undefined : self.localStorage : global.localStorage : window.localStorage;
        if (!ls) {
            throw new Error('Could not find local storage.');
        }
        return ls;
    }
}

//# sourceMappingURL=icStorage.js.map