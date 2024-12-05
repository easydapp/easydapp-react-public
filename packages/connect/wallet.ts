import {
    ComponentIdentityEvmValue,
    IdentityEvmMetadata,
} from '@jellypack/runtime/lib/model/components/identity/evm';
import {
    ComponentIdentityIcValue,
    IdentityIcMetadata,
} from '@jellypack/runtime/lib/model/components/identity/ic';
import { EvmChain } from '@jellypack/runtime/lib/model/types/evm';
import { JsonRpcProvider, JsonRpcSigner } from 'ethers';
import { Connector } from 'wagmi';

export type GetIdentityIcValue = (
    metadata: IdentityIcMetadata,
) => Promise<ComponentIdentityIcValue | undefined>;

export type GetIdentityEvmValue = (
    metadata: IdentityEvmMetadata,
) => Promise<ComponentIdentityEvmValue | undefined>;

export type ConnectWallet = {
    ic: GetIdentityIcValue;
    evm: GetIdentityEvmValue;
};

export type RainbowMetadata = {
    address: string | undefined;
    connector: Connector | undefined;
    provider: (evm_chain: EvmChain) => JsonRpcProvider;
    signer: (evm_chain: EvmChain) => JsonRpcSigner;
    switchChain: ({ chainId }: { chainId: number }) => void;
};
