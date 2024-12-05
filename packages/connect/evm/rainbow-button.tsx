import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ConnectType } from './connect-evm';
import { EvmConnectedMetadata } from './types';
import '@rainbow-me/rainbowkit/styles.css';

export function RainbowConnectButton({
    type,
    metadata,
    rainbowInit,
    setRainbowInit,
    images,
    names,
}: {
    type: ConnectType;
    metadata: EvmConnectedMetadata;
    rainbowInit: EvmConnectedMetadata | undefined;
    setRainbowInit: (m: EvmConnectedMetadata) => void;
    images: Record<string, string>;
    names: Record<string, string>;
}) {
    return (
        <ConnectButton.Custom>
            {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
            }) => {
                // Note: If your app doesn't use authentication, you
                // can remove all 'authenticationStatus' checks
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus || authenticationStatus === 'authenticated');

                return (
                    <div
                        {...(!ready && {
                            'aria-hidden': true,
                        })}
                        className="ez-flex ez-h-11 ez-w-full"
                    >
                        {!connected || !rainbowInit ? (
                            <div
                                onClick={() => {
                                    setRainbowInit(metadata);
                                    openConnectModal();
                                }}
                                className="ez-flex ez-h-full ez-w-full ez-cursor-pointer ez-items-center ez-justify-start ez-rounded-[10px] ez-border ez-border-solid ez-border-[#dddddd] ez-bg-white"
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
                        ) : chain?.unsupported ? (
                            <div
                                onClick={openChainModal}
                                className="ez-flex ez-h-full ez-w-full ez-cursor-pointer ez-items-center ez-justify-center ez-rounded-[10px] ez-bg-[#fff8f8] ez-font-['JetBrainsMono'] ez-text-sm ez-font-normal ez-leading-[18px] ez-text-[#ff5b5b]"
                            >
                                Wrong network
                            </div>
                        ) : (
                            <div className="ez-flex ez-h-full ez-w-full ez-cursor-pointer">
                                <div
                                    className="ez-flex ez-flex-1 ez-items-center ez-rounded-[10px] ez-border ez-border-solid ez-border-[#dddddd] ez-bg-white"
                                    onClick={openChainModal}
                                >
                                    {chain?.hasIcon && chain.iconUrl && (
                                        <img
                                            className="ez-ml-[15px] ez-h-[26px] ez-w-[26px]"
                                            src={chain.iconUrl}
                                        />
                                    )}
                                    <p className="ez-ml-3 ez-font-['JetBrainsMono'] ez-text-sm ez-font-normal ez-leading-[18px] ez-text-black">
                                        {chain?.name ?? 'Chain icon'}
                                    </p>
                                </div>

                                <p
                                    className="ez-ml-3 ez-cursor-pointer ez-font-['JetBrainsMono'] ez-text-sm ez-font-normal ez-leading-[18px] ez-text-black"
                                    onClick={openAccountModal}
                                >
                                    {account?.displayName}
                                    {account?.displayBalance ? ` (${account.displayBalance})` : ''}
                                </p>
                            </div>
                        )}
                    </div>
                );
            }}
        </ConnectButton.Custom>
    );
}
