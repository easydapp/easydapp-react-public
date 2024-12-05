import { ComponentId } from '@jellypack/runtime/lib/model/common/identity';
import { link_component_get_id } from '@jellypack/runtime/lib/model/components';
import {
    ComponentIdentityValue,
    match_identity_inner_metadata,
} from '@jellypack/runtime/lib/model/components/identity';
import { get_evm_anonymous } from '@jellypack/runtime/lib/model/components/identity/evm/anonymous';
import { anonymous as ic_anonymous } from '@jellypack/runtime/lib/model/components/identity/ic/anonymous';
import { Combined } from '@jellypack/runtime/lib/store/combined';
import { ConnectWallet } from '../connect/wallet';

export const get_identity = (
    upper_identity: Record<ComponentId, ComponentIdentityValue>,
    combined: Combined,
    connect_wallet: ConnectWallet,
): Record<ComponentId, ComponentIdentityValue> => {
    const identity = { ...upper_identity };
    for (const component of combined.components) {
        if ('identity' in component) {
            const id = link_component_get_id(component);
            if (identity[id] === undefined) {
                identity[id] = match_identity_inner_metadata<ComponentIdentityValue>(
                    component.identity.metadata.metadata,
                    {
                        http: (http) => ({ http }),
                        ic: (ic): ComponentIdentityValue => {
                            if (!ic.includes?.length) return { ic: ic_anonymous }; // Anonymous
                            return async () => {
                                const value = await connect_wallet.ic(ic);
                                return value ? { ic: value } : undefined;
                            };
                        },
                        evm: (evm): ComponentIdentityValue => {
                            if (!evm.includes?.length) return { evm: get_evm_anonymous(evm.chain) }; // Anonymous
                            return async () => {
                                const value = await connect_wallet.evm(evm);
                                return value ? { evm: value } : undefined;
                            };
                        },
                    },
                );
            }
        }
    }
    return identity;
};
