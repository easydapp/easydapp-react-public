import { ActorSubclass } from '@dfinity/agent';
import { IDL } from '@dfinity/candid';
import { IcWallet } from '@jellypack/runtime/lib/model/common/wallet/ic';
import { ComponentIdentityIcValue } from '@jellypack/runtime/lib/model/components/identity/ic';
import { ActorCreator } from '@jellypack/runtime/lib/model/components/identity/ic/types';
import { principal2account_id } from '@jellypack/types/lib/open/open-ic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CustomStorage } from '../../storage';
import { KEY_SINGLE_CONNECTED_RECORDS } from '../../storage/keys';
import { CustomAstroX } from './providers/astrox';
import { CustomBitfinityWallet } from './providers/bitfinity';
import { CustomICX } from './providers/icx';
import { CustomInternetIdentity, getIIFrame } from './providers/ii';
import { CustomNFID } from './providers/nfid';
import { CustomPlugWallet } from './providers/plug';
import { CustomStoicWallet } from './providers/stoic';
import { IConnector } from './providers/types';

// connect2ic provide activeProvider
export const getActorCreatorByActiveProvider = (activeProvider: IConnector): ActorCreator => {
    return async <T,>(idlFactory: IDL.InterfaceFactory, canisterId: string) => {
        const result = await activeProvider.createActor<ActorSubclass<T>>(
            canisterId,
            idlFactory as any,
        );
        if (result.isOk()) return result.value;
        if (result?.error?.message) throw new Error(result.error.message);
        if (result?.error?.kind) throw new Error(result.error.kind);
        if (result?.error) throw new Error(JSON.stringify(result.error));
        throw new Error(JSON.stringify(result));
    };
};

export type ConnectType = 'ii' | 'plug' | 'me' | 'bitfinity' | 'nfid' | 'stoic';

export const CONNECTED_TYPES: ConnectType[] = [
    'ii',
    // 'me',
    // 'bitfinity',
    //  'nfid',
    //   'stoic',
    'plug',
];

export type SingleConnectedRecord = {
    t: ConnectType; // Login method
    o: string; // Log in Principal
    c: number; // Login time, every time you log in, save it
};

type ConnectedRecord = {
    type: ConnectType;
    connected: number;
    all_connected: number;
    latest_owner: string;
    latest: number;
};

const astroXProvider = () =>
    (window as any).icx
        ? new CustomICX({
              delegationModes: ['domain', 'global'],
              dev: false,
          })
        : new CustomAstroX({
              delegationModes: ['domain', 'global'],
              dev: false,
          });
const bitfinityProvider = () => new CustomBitfinityWallet();
// Use custom II
const iiProvider = () =>
    new CustomInternetIdentity({
        windowOpenerFeatures: window.innerWidth < 768 ? undefined : getIIFrame(),
    });
// Use the custom plug
const plugProvider = () => new CustomPlugWallet();
const nfidProvider = () =>
    new CustomNFID({
        windowOpenerFeatures: window.innerWidth < 768 ? undefined : getIIFrame(),
    });
const stoicProvider = () => new CustomStoicWallet();

const providers = {
    ii: iiProvider,
    plug: plugProvider,
    me: astroXProvider,
    bitfinity: bitfinityProvider,
    nfid: nfidProvider,
    stoic: stoicProvider,
};

const doConnect = async (wallet: IcWallet): Promise<ComponentIdentityIcValue> => {
    console.log('connect wallet =>', wallet);
    const type = Object.keys(wallet)[0] as ConnectType;

    const provider = providers[type](); // ! parameter
    await provider.init();
    await provider.connect();
    const is_connected = await provider.isConnected();
    const owner = provider.principal;
    if (!is_connected || !owner) throw new Error('connect failed');

    const value = {
        wallet,
        secret: undefined,

        is_connected: async () => await provider.isConnected(),
        creator: getActorCreatorByActiveProvider(provider as any),
        // creator: async (idlFactory: IDL.InterfaceFactory, canisterId: string) => {
        //     const actor = await provider.createActor(canisterId, idlFactory as any);
        //     return actor;
        // },
        owner,
        account_id: principal2account_id(owner),
    };

    console.error('got ic identity value', value);

    return value;
};

export const useConnect2Ic = (
    storage: CustomStorage,
): {
    records: ConnectedRecord[];
    onConnect: (wallet: IcWallet) => Promise<ComponentIdentityIcValue | undefined>;
    connecting: boolean;
} => {
    const [singleRecords, setSingleRecords] = useState<SingleConnectedRecord[]>([]);
    useEffect(() => {
        storage.getItem(KEY_SINGLE_CONNECTED_RECORDS).then((json) => {
            json ??= '[]';
            const records: SingleConnectedRecord[] = JSON.parse(json);
            setSingleRecords(records);
        });
    }, [storage]);

    const records: ConnectedRecord[] = useMemo(() => {
        return CONNECTED_TYPES.map((type) => {
            const records = singleRecords.filter((r) => r.t === type);
            const latest =
                records.length === 0
                    ? undefined
                    : records.length === 1
                      ? records[0]
                      : records.reduce((p, c) => (p.c <= c.c ? c : p));
            return {
                type,
                connected: records.filter(
                    (v, i, a) => a.findIndex((vv) => vv.c === v.c && vv.o === v.o) === i, // distinct
                ).length,
                all_connected: records.length,
                latest_owner: latest?.o ?? '--',
                latest: latest?.c ?? 0,
            };
        });
    }, [singleRecords]);

    const [connecting, setConnecting] = useState(false);

    const onConnect = useCallback(async (wallet: IcWallet): Promise<ComponentIdentityIcValue> => {
        return new Promise((resolve, reject) => {
            setConnecting(true);
            doConnect(wallet)
                .then(resolve, reject)
                .finally(() => setConnecting(false));
        });
    }, []);

    return {
        records,
        onConnect,
        connecting,
    };
};
