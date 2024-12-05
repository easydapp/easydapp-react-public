import { EvmWallet } from '@jellypack/runtime/lib/model/common/wallet/evm';
import {
    ComponentIdentityEvmValue,
    IdentityEvmMetadata,
} from '@jellypack/runtime/lib/model/components/identity/evm';
import { get_evm_chain_id_by_chain } from '@jellypack/runtime/lib/model/types/evm';
import { ethers } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CustomStorage } from '../../storage';
import { KEY_SINGLE_CONNECTED_RECORDS } from '../../storage/keys';
import { RainbowMetadata } from '../wallet';

export type ConnectType = 'metamask' | 'rainbow';

export const CONNECTED_TYPES: ConnectType[] = [
    'metamask',
    // 'rainbow'
];

export type SingleConnectedRecord = {
    t: ConnectType; // Login method
    a: string; // Log in account
    c: number; // Login time, every time you log in, save it
};

type ConnectedRecord = {
    type: ConnectType;
    connected: number;
    all_connected: number;
    latest_account: string;
    latest: number;
};

const doConnect = async (
    wallet: EvmWallet,
    metadata: IdentityEvmMetadata,
    rainbow?: RainbowMetadata,
): Promise<ComponentIdentityEvmValue> => {
    console.log('connect wallet =>', wallet);
    const type = Object.keys(wallet)[0] as ConnectType;

    const chain_id = get_evm_chain_id_by_chain(metadata.chain);

    const provider = await (async () => {
        switch (type) {
            case 'metamask': {
                const ethereum = (window as any).ethereum;
                if (!ethereum) throw new Error('metamask not installed');

                // See the link first
                await ethereum.request({ method: 'eth_requestAccounts' });

                const get_current_chain_id = async () => {
                    const currentChainId = await ethereum.request({ method: 'eth_chainId' });
                    return parseInt(currentChainId, 16);
                };
                let current = await get_current_chain_id();
                console.debug(`🚀 ~ .then ~ current:`, current);

                // Guarantee the consistency of the network
                while (true) {
                    if (chain_id === current) break;
                    try {
                        // Request user switch to the target network
                        await ethereum.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: `0x${chain_id.toString(16)}` }],
                        });
                        console.warn(`Switched to chain ID: ${chain_id}`);
                    } catch (error: any) {
                        console.error('Error switching networks:', error);
                        throw error;
                    }
                    current = await get_current_chain_id();
                }

                // Always report an error, no chain ID is set
                // const provider = new ethers.BrowserProvider(ethereum, {
                //     chainId: chain_id,
                // });
                const provider = new ethers.BrowserProvider(ethereum, chain_id);
                // const provider = new ethers.BrowserProvider(ethereum);

                // It also provides an opportunity to request access to write
                // operations, which will be performed by the private key
                // that MetaMask manages for the user.
                const signer = await provider.getSigner();
                const account = signer.address;
                console.debug(`🚀 ~ .then ~ account:`, account);

                return {
                    is_connected: async () => true,
                    provider,
                    signer,
                    account,
                };
            }
            case 'rainbow': {
                if (!rainbow) throw new Error('rainbow not installed');
                const account = rainbow.address;
                if (!account) throw Error('can not connect to rainbow');

                rainbow.switchChain({ chainId: chain_id });

                const provider = rainbow.provider(metadata.chain);
                console.debug(`🚀 ~ provider ~ provider:`, provider);
                const signer = rainbow.signer(metadata.chain);
                console.debug(`🚀 ~ provider ~ signer:`, signer);

                if (!provider || !signer) throw Error('can not connect to rainbow');

                // const _provider = await rainbow.connector?.getProvider({ chainId: chain_id });
                // if (!account || !_provider) throw Error('can not connect to rainbow');

                // const provider = _provider as any;

                // console.debug(`🚀 ~ provider ~ provider:`, provider);
                // const signer = await provider.getSigner();

                return {
                    is_connected: async () => !!account,
                    provider,
                    signer,
                    account,
                };

                throw new Error(`unimplemented wallet: ${JSON.stringify(wallet)}`);
            }
            default:
                throw new Error(`unimplemented wallet: ${JSON.stringify(wallet)}`);
        }
    })();

    const value = {
        chain: metadata.chain,
        chain_id: chain_id,
        wallet,
        secret: undefined,

        is_connected: provider.is_connected,
        provider: provider.provider,
        signer: provider.signer,

        account: provider.account,
    };

    console.error('got evm identity value', metadata, value);

    return value;
};

export const useConnect2Evm = (
    storage: CustomStorage,
): {
    records: ConnectedRecord[];
    onConnect: (
        wallet: EvmWallet,
        metadata: IdentityEvmMetadata,
        rainbow?: RainbowMetadata,
    ) => Promise<ComponentIdentityEvmValue | undefined>;
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
                    (v, i, a) => a.findIndex((vv) => vv.c === v.c && vv.a === v.a) === i, // distinct
                ).length,
                all_connected: records.length,
                latest_account: latest?.a ?? '--',
                latest: latest?.c ?? 0,
            };
        });
    }, [singleRecords]);

    const [connecting, setConnecting] = useState(false);

    const onConnect = useCallback(
        async (
            wallet: EvmWallet,
            metadata: IdentityEvmMetadata,
            rainbow?: RainbowMetadata,
        ): Promise<ComponentIdentityEvmValue> => {
            return new Promise((resolve, reject) => {
                setConnecting(true);
                doConnect(wallet, metadata, rainbow)
                    .then(resolve, reject)
                    .finally(() => setConnecting(false));
            });
        },
        [],
    );

    return {
        records,
        onConnect,
        connecting,
    };
};
