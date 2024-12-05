import {
    EvmChain,
    get_evm_chain_id_by_chain,
    match_evm_chain,
} from '@jellypack/runtime/lib/model/types/evm';
import { FallbackProvider, JsonRpcProvider } from 'ethers';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { useMemo } from 'react';
import type { Account, Chain, Client, Transport } from 'viem';
import { type Config, useClient, useConnectorClient } from 'wagmi';

const get_network = (evm_chain: EvmChain) => {
    const network = {
        chainId: get_evm_chain_id_by_chain(evm_chain),
        name: match_evm_chain(evm_chain, {
            ethereum: () => 'Ethereum',
            ethereum_test_sepolia: () => 'Sepolia',
            polygon: () => 'Polygon',
            polygon_test_amoy: () => 'Polygon Amoy',
            bsc: () => 'BNB Smart Chain',
            bsc_test: () => 'Binance Smart Chain Testnet',
        }),
    };
    return network;
};

export function clientToProvider(client: Client<Transport, Chain>) {
    // const { chain, transport } = client;
    const { transport } = client;

    return (evm_chain: EvmChain) => {
        // const network = {
        //     chainId: chain.id,
        //     name: chain.name,
        //     ensAddress: chain.contracts?.ensRegistry?.address,
        // };
        const network = get_network(evm_chain);
        if (transport.type === 'fallback') {
            const providers = (transport.transports as ReturnType<Transport>[]).map(
                ({ value }) => new JsonRpcProvider(value?.url, network),
            );
            if (providers.length === 1) return providers[0];
            return new FallbackProvider(providers);
        }
        return new JsonRpcProvider(transport.url, network);
    };
}

/** Action to convert a viem Client to an ethers.js Provider. */
export function useEthersProvider({ chainId }: { chainId?: number } = {}) {
    const client = useClient<Config>({ chainId });
    return useMemo(() => (client ? clientToProvider(client) : undefined), [client]);
}

export function clientToSigner(client: Client<Transport, Chain, Account>) {
    // const { account, chain, transport } = client;
    const { account, transport } = client;
    return (evm_chain: EvmChain) => {
        // const network = {
        //     chainId: chain.id,
        //     name: chain.name,
        //     ensAddress: chain.contracts?.ensRegistry?.address,
        // };
        const network = get_network(evm_chain);
        const provider = new BrowserProvider(transport, network);
        const signer = new JsonRpcSigner(provider, account.address);
        return signer;
    };
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
    const { data: client } = useConnectorClient<Config>({ chainId });
    return useMemo(() => (client ? clientToSigner(client) : undefined), [client]);
}
