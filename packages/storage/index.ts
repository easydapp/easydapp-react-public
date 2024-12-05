export type CustomStorage = {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
};

export const wrap_storage = (anchor: string, storage?: CustomStorage) => {
    storage ??= {
        getItem: async (key: string) => localStorage.getItem(key),
        setItem: async (key: string, value: string) => localStorage.setItem(key, value),
        removeItem: async (key: string) => localStorage.removeItem(key),
    };

    const wrap_key = (key: string) => `__easydapp__${anchor}__${key}`;

    return {
        getItem: (key: string) => storage.getItem(wrap_key(key)),
        setItem: (key: string, value: string) => storage.setItem(wrap_key(key), value),
        removeItem: (key: string) => storage.removeItem(wrap_key(key)),
    };
};
