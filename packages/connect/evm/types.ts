import { EvmWallet } from '@jellypack/runtime/lib/model/common/wallet/evm';
import { IdentityEvmMetadata } from '@jellypack/runtime/lib/model/components/identity/evm';

export type EvmConnectedMetadata = {
    metadata: IdentityEvmMetadata;
    wallets: EvmWallet[];
    size: any;
    key: number;
};
