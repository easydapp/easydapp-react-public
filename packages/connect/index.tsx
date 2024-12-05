import { useEffect, useState } from 'react';
import { CustomStorage } from '../storage';
import { Connect2EvmModal } from './evm';
import { Connect2IcModal } from './ic';
import { ConnectWallet, GetIdentityEvmValue, GetIdentityIcValue } from './wallet';

export function ConnectWalletView({
    storage,
    setConnectWallet,
}: {
    storage: CustomStorage;
    setConnectWallet: (connect_wallet: ConnectWallet) => void;
}) {
    const [ic, setIc] = useState<{ value: GetIdentityIcValue }>();
    const [evm, setEvm] = useState<{ value: GetIdentityEvmValue }>();

    useEffect(() => {
        if (!ic) return;
        if (!evm) return;

        setConnectWallet({
            ic: ic.value,
            evm: evm.value,
        });
    }, [setConnectWallet, ic, evm]);

    return (
        <>
            <Connect2IcModal storage={storage} setIc={setIc} />
            <Connect2EvmModal storage={storage} setEvm={setEvm} />
        </>
    );
}
