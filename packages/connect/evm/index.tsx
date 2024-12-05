import { EvmWallet } from '@jellypack/runtime/lib/model/common/wallet/evm';
import {
    ComponentIdentityEvmValue,
    IdentityEvmMetadata,
} from '@jellypack/runtime/lib/model/components/identity/evm';
import { useCallback, useEffect, useState } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import Icon from '../../common/icon';
import { CustomStorage } from '../../storage';
import { GetIdentityEvmValue, RainbowMetadata } from '../wallet';
import { CONNECTED_TYPES, ConnectType, useConnect2Evm } from './connect-evm';
import { useEthersProvider, useEthersSigner } from './hooks';
import connect_metamask from './images/connect-metamask.svg';
import connect_rainbow from './images/connect-rainbow.svg';
// import { RainbowConnectButton } from './rainbow-button';
import { EvmConnectedMetadata } from './types';

const images: Record<string, string> = {
    metamask: connect_metamask,
    rainbow: connect_rainbow,
};

const names: Record<ConnectType, string> = {
    metamask: 'MetaMask',
    rainbow: 'Rainbow',
};

let count = 0;
const cached: Record<
    number,
    {
        show: boolean;
        value?: ComponentIdentityEvmValue;
    }
> = {};

export function Connect2EvmModal({
    storage,
    setEvm,
}: {
    storage: CustomStorage;
    setEvm: (ic: { value: GetIdentityEvmValue }) => void;
}) {
    const { onConnect } = useConnect2Evm(storage);

    const [metadata, setMetadata] = useState<EvmConnectedMetadata>();

    const onClose = () => {
        for (const key in cached) cached[key].show = false;
        setMetadata(undefined);
    };

    const evm = useCallback(
        async (metadata: IdentityEvmMetadata): Promise<ComponentIdentityEvmValue | undefined> => {
            count += 1;
            for (const key in cached) delete cached[key];
            const key = count;
            cached[key] = { show: true };

            const includes = metadata.includes ?? [{ any: {} }];
            const is_any = !!includes.find((s) => 'any' in s);
            let wallets = CONNECTED_TYPES.map((t) => {
                const wallet = includes.find((s) => t in s);
                if (wallet) return wallet;
                if (is_any) {
                    const omit: any = {};
                    omit[t] = {};
                    return omit as unknown as EvmWallet;
                }
                return undefined;
            }).filter((s) => !!s);
            const excludes = metadata.excludes;
            if (excludes) {
                wallets = wallets.filter((t) => !excludes.find((s) => Object.keys(t)[0] in s));
            }
            if (wallets.length === 0) return undefined;

            const size = ['xs', 'sm', 'md'][Math.ceil(wallets.length / 2) - 1];

            console.error('show evm modal', metadata);

            setMetadata({ metadata, wallets, size, key });

            let interval: any = undefined;
            return new Promise<ComponentIdentityEvmValue | undefined>((resolve) => {
                interval = setInterval(() => {
                    if (!cached[key] || !cached[key].show) {
                        clearInterval(interval);
                        delete cached[key];
                        resolve(undefined);
                    }
                    if (cached[key]?.value) {
                        clearInterval(interval);
                        const value = cached[key].value;
                        delete cached[key];
                        onClose();
                        resolve(value);
                    }
                }, 33);
            });
        },
        [],
    );

    useEffect(() => {
        setEvm({ value: evm });
    }, [setEvm, evm]);

    const onChoose = useCallback(
        (wallet: EvmWallet, metadata: EvmConnectedMetadata, rainbow?: RainbowMetadata) => {
            if (metadata?.metadata) {
                onConnect(wallet, metadata.metadata, rainbow).then((value) => {
                    if (value && metadata?.key && cached[metadata.key]) {
                        cached[metadata.key].value = value;
                    }
                });
            }
        },
        [onConnect],
    );

    const { address: rainbowAddress, connector: rainbowConnector } = useAccount();
    const rainbowProvider = useEthersProvider() as any;
    // console.debug(`🚀 ~ rainbowProvider:`, rainbowProvider);
    const rainbowSigner = useEthersSigner() as any;
    // console.debug(`🚀 ~ rainbowSigner:`, rainbowSigner);

    const { switchChain } = useSwitchChain();

    const [rainbowInit, setRainbowInit] = useState<EvmConnectedMetadata>();

    useEffect(() => {
        if (!rainbowInit) return;
        if (
            !rainbowAddress ||
            !rainbowConnector ||
            !rainbowProvider ||
            !rainbowSigner ||
            !switchChain
        )
            return;
        if (rainbowSigner)
            onChoose(rainbowInit.wallets.find((s) => 'rainbow' in s)!, rainbowInit, {
                address: rainbowAddress,
                connector: rainbowConnector,
                provider: rainbowProvider,
                signer: rainbowSigner,
                switchChain: switchChain,
            });
    }, [
        rainbowInit,
        onChoose,
        metadata,
        rainbowAddress,
        rainbowConnector,
        rainbowProvider,
        rainbowSigner,
        switchChain,
    ]);

    return (
        <>
            {!!metadata?.size && (
                <div className="ez-absolute ez-left-0 ez-top-0 ez-flex ez-h-full ez-w-full ez-items-end ez-justify-center ez-bg-black/30 ez-backdrop-blur-[15px]">
                    <div className="ez-relative ez-mx-[15px] ez-mb-[17px] ez-flex ez-flex-1 ez-flex-col ez-rounded-2xl ez-bg-white">
                        <div
                            className="ez-absolute ez-right-[10px] ez-top-[10px] ez-h-6 ez-w-6 ez-cursor-pointer"
                            onClick={onClose}
                        >
                            <Icon
                                name="icon-close"
                                className="ez-h-6 ez-w-6 ez-text-[#d9d9d9]"
                            ></Icon>
                        </div>
                        <div className="flex ez-mt-[17px] ez-items-center ez-justify-center ez-font-['JetBrainsMono'] ez-text-base ez-font-medium ez-leading-[18px] ez-text-black">
                            Connect to {metadata?.metadata.chain}
                        </div>
                        <div className="ez-mb-3 ez-mt-[33px] ez-flex ez-items-center ez-justify-center">
                            <div className="ez-mx-5 ez-mb-3 ez-flex ez-w-full ez-flex-col ez-items-center ez-justify-center ez-gap-y-4">
                                {metadata?.wallets &&
                                    CONNECTED_TYPES.filter((t) =>
                                        metadata.wallets.find((s) => t in s),
                                    ).map((type) => (
                                        <div key={type} className="ez-w-full">
                                            {type === 'rainbow' && (
                                                // <RainbowConnectButton
                                                //     type={type}
                                                //     metadata={metadata}
                                                //     rainbowInit={rainbowInit}
                                                //     setRainbowInit={setRainbowInit}
                                                //     images={images}
                                                //     names={names}
                                                // />
                                                <div
                                                    onClick={() => {
                                                        console.error('xxx', setRainbowInit);
                                                    }}
                                                ></div>
                                            )}

                                            {type === 'metamask' && (
                                                <div
                                                    className="ez-flex ez-h-11 ez-w-full ez-cursor-pointer ez-items-center ez-justify-start ez-rounded-[10px] ez-border ez-border-solid ez-border-[#dddddd] ez-bg-white"
                                                    onClick={() =>
                                                        onChoose(
                                                            metadata.wallets.find(
                                                                (s) => type in s,
                                                            )!,
                                                            metadata,
                                                        )
                                                    }
                                                >
                                                    <img
                                                        className="ez-ml-[15px] ez-h-[26px] ez-w-[26px]"
                                                        src={images[type]}
                                                        alt=""
                                                    />
                                                    <div className="ez-ml-3 ez-font-['JetBrainsMono'] ez-text-sm ez-font-normal ez-leading-[18px] ez-text-black">
                                                        {names[type]}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
