import { IcWallet } from '@jellypack/runtime/lib/model/common/wallet/ic';
import {
    ComponentIdentityIcValue,
    IdentityIcMetadata,
} from '@jellypack/runtime/lib/model/components/identity/ic';
import { useCallback, useEffect, useState } from 'react';
import Icon from '../../common/icon';
import { CustomStorage } from '../../storage';
import { GetIdentityIcValue } from '../wallet';
import { CONNECTED_TYPES, ConnectType, useConnect2Ic } from './connect-ic';
import connect_bitfinity from './images/connect-bitfinity.svg';
import connect_ii from './images/connect-ii.svg';
import connect_me from './images/connect-me.svg';
import connect_nfid from './images/connect-nfid.svg';
import connect_plug from './images/connect-plug.svg';
import connect_stoic from './images/connect-stoic.png';

const images: Record<string, string> = {
    ii: connect_ii,
    me: connect_me,
    bitfinity: connect_bitfinity,
    nfid: connect_nfid,
    stoic: connect_stoic,
    plug: connect_plug,
};

const names: Record<ConnectType, string> = {
    ii: 'II',
    me: 'Me',
    bitfinity: 'Bitfinity',
    nfid: 'NFID',
    stoic: 'Stoic',
    plug: 'Plug',
};

let count = 0;
const cached: Record<
    number,
    {
        show: boolean;
        value?: ComponentIdentityIcValue;
    }
> = {};

export function Connect2IcModal({
    storage,
    setIc,
}: {
    storage: CustomStorage;
    setIc: (ic: { value: GetIdentityIcValue }) => void;
}) {
    const { onConnect } = useConnect2Ic(storage);

    const [metadata, setMetadata] = useState<{
        metadata: IdentityIcMetadata;
        wallets: IcWallet[];
        size: any;
        key: number;
    }>();

    const onClose = () => {
        for (const key in cached) cached[key].show = false;
        setMetadata(undefined);
    };

    const ic = useCallback(
        async (metadata: IdentityIcMetadata): Promise<ComponentIdentityIcValue | undefined> => {
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
                    return omit as unknown as IcWallet;
                }
                return undefined;
            }).filter((s) => !!s);
            const excludes = metadata.excludes;
            if (excludes) {
                wallets = wallets.filter((t) => !excludes.find((s) => Object.keys(t)[0] in s));
            }
            if (wallets.length === 0) return undefined;

            const size = ['xs', 'sm', 'md'][Math.ceil(wallets.length / 2) - 1];

            console.error('show ic modal', metadata);

            setMetadata({ metadata, wallets, size, key });

            let interval: any = undefined;
            return new Promise<ComponentIdentityIcValue | undefined>((resolve) => {
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
                }, 100);
            });
        },
        [],
    );

    useEffect(() => {
        setIc({ value: ic });
    }, [setIc, ic]);

    const onChoose = (wallet: IcWallet) => {
        onConnect(wallet).then((value) => {
            if (value && metadata?.key) {
                cached[metadata.key].value = value;
            }
        });
    };

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
                            Connect to IC
                        </div>
                        <div className="ez-mb-3 ez-mt-[33px] ez-flex ez-items-center ez-justify-center">
                            <div className="ez-mx-5 ez-mb-3 ez-flex ez-w-full ez-flex-col ez-items-center ez-justify-center ez-gap-y-4">
                                {metadata?.wallets &&
                                    CONNECTED_TYPES.filter((t) =>
                                        metadata.wallets.find((s) => t in s),
                                    ).map((type) => (
                                        <div
                                            key={type}
                                            className="ez-flex ez-h-11 ez-w-full ez-cursor-pointer ez-items-center ez-justify-start ez-rounded-[10px] ez-border ez-border-solid ez-border-[#dddddd] ez-bg-white"
                                            onClick={() =>
                                                onChoose(metadata.wallets.find((s) => type in s)!)
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
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
