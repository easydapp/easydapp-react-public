import { query_api } from '@jellypack/runtime/lib/canisters/storage';
import { EvmChain, match_evm_chain } from '@jellypack/runtime/lib/model/types/evm';
import { CallingData } from '@jellypack/runtime/lib/runtime/calling';
import { ApiData, ApiDataAnchor } from '@jellypack/runtime/lib/store/api';
import { principal2account_id } from '@jellypack/types/lib/open/open-ic';
import { useEffect, useState } from 'react';
import { Copied } from '../common/copied';
import Icon from '../common/icon';
import { Opened } from '../common/opened';
import { cn } from '../common/utils';
import { CallItem, is_call_item_doing, match_call_item } from './call';

export function DappStatusContractView({
    calling,
    item,
    query_api: upper_query_api,
}: {
    calling: number;
    item: CallItem;
    query_api?: (anchor: ApiDataAnchor) => Promise<ApiData | undefined>;
}) {
    const [itemHover, setItemHover] = useState(false);

    const [doing, setDoing] = useState(false);

    useEffect(() => {
        const doing = is_call_item_doing(item);
        setDoing(doing);
    }, [calling, item]);

    return (
        <>
            <div
                className="ez-flex ez-h-10 ez-w-[24px] ez-items-center"
                onMouseEnter={() => {
                    setItemHover(true);
                }}
                onMouseLeave={() => {
                    setItemHover(false);
                }}
            >
                {itemHover && (
                    <div className="ez-absolute ez-left-[3px] ez-top-[39px] ez-z-50 ez-flex ez-w-[calc(100%-30px)] ez-flex-col ez-rounded-lg ez-bg-white ez-px-3 ez-py-[10px] ez-shadow">
                        {match_call_item(item, {
                            http: (http) => <ContentHttpView list={http.list} />,
                            ic: (ic) => (
                                <ContentIcView
                                    caller={ic.caller}
                                    canister_id={ic.canister_id}
                                    list={ic.list}
                                    query_api={upper_query_api}
                                />
                            ),
                            evm_call: (evm_call) => (
                                <ContentEvmCallView
                                    chain={evm_call.chain}
                                    account={evm_call.account}
                                    contract={evm_call.contract}
                                    list={evm_call.list}
                                    query_api={upper_query_api}
                                />
                            ),
                            evm_sign: (evm_sign) => (
                                <ContentEvmSignView
                                    chain={evm_sign.chain}
                                    account={evm_sign.account}
                                    message={evm_sign.message}
                                    data={evm_sign.data}
                                />
                            ),
                            evm_transaction: (evm_transaction) => (
                                <ContentEvmTransactionView
                                    chain={evm_transaction.chain}
                                    account={evm_transaction.account}
                                    contract={evm_transaction.contract}
                                    list={evm_transaction.list}
                                    query_api={upper_query_api}
                                />
                            ),
                            evm_deploy: (evm_deploy) => (
                                <ContentEvmDeployView
                                    chain={evm_deploy.chain}
                                    account={evm_deploy.account}
                                    data={evm_deploy.data}
                                />
                            ),
                            evm_transfer: (evm_transfer) => (
                                <ContentEvmTransferView
                                    chain={evm_transfer.chain}
                                    account={evm_transfer.account}
                                    transfer_to={evm_transfer.transfer_to}
                                    list={evm_transfer.list}
                                />
                            ),
                        })}
                    </div>
                )}

                <div
                    className={cn(
                        'ez-flex ez-h-[24px] ez-w-[24px] ez-flex-shrink-0 ez-cursor-pointer ez-items-center ez-justify-center ez-rounded-full ez-duration-150',
                        !itemHover ? (doing ? 'ez-bg-[#12C637]' : 'ez-bg-black') : 'ez-bg-white',
                    )}
                    style={{
                        zIndex: itemHover ? 10000 : 0,
                    }}
                >
                    <Icon
                        name="icon-contracts"
                        className={cn(
                            'ez-h-[12px] ez-w-[12px] ez-flex-shrink-0 ez-duration-150',
                            !itemHover
                                ? doing
                                    ? 'ez-text-white'
                                    : 'ez-text-white'
                                : 'ez-text-black',
                        )}
                    />
                </div>
            </div>
        </>
    );
}

const Label = ({ title }: { title: string }) => {
    return (
        <div className="ez-font-['JetBrainsMono'] ez-text-xs ez-font-normal ez-leading-snug ez-text-[#999999]">
            {title}:{' '}
        </div>
    );
};

// ====================================== http ======================================

function ContentHttpView({ list }: { list: CallingData[] }) {
    return (
        <div className="ez-flex ez-w-full ez-flex-col">
            {list.map((data) => (
                <ContentHttpDataView key={data.id} data={data} />
            ))}
        </div>
    );
}

function ContentHttpDataView({ data }: { data: CallingData }) {
    let url = '';
    let method: 'GET' | 'POST' | 'PUT' | 'DELETE' | undefined = undefined;
    let spend = 0;

    const d = data.data.length ? data.data[data.data.length - 1] : undefined;
    if (d && 'http' in d.data) {
        url = d.data.http.url;
        method = d.data.http.method;
        if (d.end) spend = d.end - d.start;
    }

    return (
        <>
            {url && method && (
                <div className="ez-flex ez-w-full ez-flex-col ez-items-center">
                    <div className="ez-flex ez-w-full ez-items-center ez-justify-between">
                        <div className="ez-flex ez-items-center">
                            <div className="ez-mr-2 ez-font-['JetBrainsMono'] ez-text-xs ez-font-normal ez-text-[#999999]">
                                #{data.id}
                            </div>
                            <div
                                className={`ez-font-['JetBrainsMono'] ez-text-xs ez-font-normal ${(() => {
                                    switch (method) {
                                        case 'GET':
                                            return 'ez-text-blue-500';
                                        case 'POST':
                                            return 'ez-text-green-500';
                                        case 'PUT':
                                            return 'ez-text-yellow-500';
                                        case 'DELETE':
                                            return 'ez-text-red-500';
                                    }
                                })()}`}
                            >
                                {method}
                            </div>
                        </div>
                        <div className="ez-flex ez-items-center ez-gap-x-2">
                            <div className="ez-font-['JetBrainsMono'] ez-text-xs ez-font-normal ez-text-[#999999]">
                                {data.is_pending() ? 'pending' : spend / 1000 + 's'}
                            </div>
                            <Copied value={url} />
                        </div>
                    </div>

                    <div className="ez-mt-[6px] ez-flex ez-items-center ez-justify-between ez-break-all ez-text-left ez-font-['JetBrainsMono'] ez-text-xs ez-font-normal ez-text-black">
                        {url}
                    </div>
                </div>
            )}
        </>
    );
}

// ====================================== ic ======================================
function ContentIcView({
    caller,
    canister_id,
    list,
    query_api: upper_query_api,
}: {
    caller: string;
    canister_id: string;
    list: CallingData[];
    query_api?: (anchor: ApiDataAnchor) => Promise<ApiData | undefined>;
}) {
    const [w_caller, w_caller_copied] = (() => {
        switch (caller) {
            case '':
                return ['?', false];
            case '2vxsx-fae':
                return ['anonymous', false];
            default:
                return [caller, true];
        }
    })();

    const [w_canister_id, w_canister_id_copied] = (() => {
        switch (canister_id) {
            case '':
                return ['?', false];
            default:
                return [canister_id, true];
        }
    })();

    return (
        <div className="ez-flex ez-w-full ez-flex-col ez-gap-y-[6px]">
            <div className="ez-flex ez-items-center">
                <Label title="Caller" />
                <div className="ez-ml-1 ez-flex ez-flex-1 ez-items-center ez-gap-x-2">
                    {!w_caller_copied && (
                        <div className="ez-flex ez-flex-1 ez-truncate ez-font-['JetBrainsMono'] ez-text-xs ez-font-normal ez-text-black">
                            {w_caller}
                        </div>
                    )}
                    {w_caller_copied && (
                        <>
                            <div>
                                {w_caller.substring(0, 12) +
                                    '...' +
                                    w_caller.substring(w_caller.length - 9)}
                            </div>
                            <Copied value={w_caller} />
                            <Opened
                                url={`https://dashboard.internetcomputer.org/account/${principal2account_id(
                                    w_caller,
                                )}`}
                            />
                        </>
                    )}
                </div>
            </div>

            <div className="ez-flex ez-items-center">
                <Label title="Canister" />
                <div className="ez-ml-1 ez-flex ez-flex-1 ez-items-center ez-gap-x-2">
                    <div className="ez-flex ez-flex-1 ez-truncate ez-font-['JetBrainsMono'] ez-text-xs ez-font-normal ez-text-black">
                        {w_canister_id}
                    </div>
                    {w_canister_id_copied && (
                        <>
                            <Copied value={w_canister_id} />
                            <Opened
                                url={`https://dashboard.internetcomputer.org/canister/${w_canister_id}`}
                            />
                        </>
                    )}
                </div>
            </div>

            {list.length === 1 && (
                <ContentIcDataView single={true} data={list[0]} query_api={upper_query_api} />
            )}

            {list.length !== 1 && (
                <>
                    <div className="ez-mt-2 ez-border-t-2 ez-border-dotted ez-pt-2">
                        {list.map((data) => (
                            <ContentIcDataView
                                key={data.id}
                                data={data}
                                query_api={upper_query_api}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function ContentIcDataView({
    single,
    data,
    query_api: upper_query_api,
}: {
    single?: boolean;
    data: CallingData;
    query_api?: (anchor: ApiDataAnchor) => Promise<ApiData | undefined>;
}) {
    const [method, setMethod] = useState(
        (() => {
            if ('ic' in data.component.metadata) {
                if ('api' in data.component.metadata.ic.action.call.api) {
                    if ('single' in data.component.metadata.ic.action.call.api.api) {
                        return data.component.metadata.ic.action.call.api.api.single.api
                            .split(':')[0]
                            .trim();
                    } else {
                        return data.component.metadata.ic.action.call.api.api.origin.method;
                    }
                }
            }
            return undefined;
        })(),
    );
    console.debug(`🚀 ~ ContentIcDataView ~ method:`, method, data);

    const [spend, setSpend] = useState(0);

    useEffect(() => {
        const d = data.data.length ? data.data[data.data.length - 1] : undefined;
        if (d && 'ic' in d.data) {
            setMethod(d.data.ic.call.method);
            if (d.end) setSpend(d.end - d.start);
        }
    }, [data]);

    useEffect(() => {
        if (method) return;
        if ('ic' in data.component.metadata) {
            if ('anchor' in data.component.metadata.ic.action.call.api) {
                (upper_query_api ?? query_api)(
                    data.component.metadata.ic.action.call.api.anchor,
                ).then((api: ApiData | undefined) => {
                    if (!api) return;
                    if ('ic' in api.content) {
                        if ('single' in api.content.ic) {
                            setMethod(api.content.ic.single.api.split(':')[0].trim());
                        } else {
                            setMethod(api.content.ic.origin.method);
                        }
                    }
                });
            }
        }
    }, [method, data, upper_query_api]);
    return (
        <>
            {
                <div className="ez-flex ez-items-center ez-justify-between">
                    <div className="ez-flex ez-items-center ez-justify-start">
                        <Label title={!single ? `Method #${data.id}` : 'Method'} />
                        <div className="ez-ml-2 ez-flex ez-items-center ez-justify-center ez-font-['JetBrainsMono'] ez-text-xs ez-font-normal ez-leading-snug ez-text-black">
                            {method ?? '?'}
                        </div>
                    </div>

                    <div className="ez-ml-2 ez-font-['JetBrainsMono'] ez-text-xs ez-font-normal ez-text-[#999999]">
                        {spend === 0 && data.is_pending() && 'pending'}
                        {spend !== 0 && <>{spend / 1000}s</>}
                    </div>
                </div>
            }
        </>
    );
}

// ====================================== evm sign ======================================

const get_evm_account_opened = (chain: EvmChain, account: string): string => {
    return match_evm_chain(chain, {
        ethereum: () => `https://etherscan.io/address/${account}`,
        ethereum_test_sepolia: () => `https://sepolia.etherscan.io/address/${account}`,

        polygon: () => `https://polygonscan.com/address/${account}`,
        polygon_test_amoy: () => `https://amoy.polygonscan.com/address/${account}`,

        bsc: () => `https://bscscan.com/address/${account}`,
        bsc_test: () => `https://testnet.bscscan.com/address/${account}`,
    });
};

const get_evm_address_opened = (chain: EvmChain, address: string): string => {
    return match_evm_chain(chain, {
        ethereum: () => `https://etherscan.io/address/${address}`,
        ethereum_test_sepolia: () => `https://sepolia.etherscan.io/address/${address}`,

        polygon: () => `https://polygonscan.com/address/${address}`,
        polygon_test_amoy: () => `https://amoy.polygonscan.com/address/${address}`,

        bsc: () => `https://bscscan.com/address/${address}`,
        bsc_test: () => `https://testnet.bscscan.com/address/${address}`,
    });
};

const get_evm_tx_opened = (chain: EvmChain, tx: string): string => {
    return match_evm_chain(chain, {
        ethereum: () => `https://etherscan.io/tx/${tx}`,
        ethereum_test_sepolia: () => `https://sepolia.etherscan.io/tx/${tx}`,

        polygon: () => `https://polygonscan.com/address/${tx}`,
        polygon_test_amoy: () => `https://amoy.polygonscan.com/tx/${tx}`,

        bsc: () => `https://bscscan.com/tx/${tx}`,
        bsc_test: () => `https://testnet.bscscan.com/tx/${tx}`,
    });
};

function ShowEvmChainView({ chain }: { chain: EvmChain }) {
    return (
        <div className="ez-flex ez-w-full ez-items-center">
            <Label title="Chain" />
            <div className="ez-ml-1 ez-flex ez-font-['JetBrainsMono'] ez-text-xs ez-font-normal ez-text-black">
                {chain}
            </div>
        </div>
    );
}

function ShowEvmAccountView({
    chain,
    account,
    title,
}: {
    chain: EvmChain;
    account: string;
    title?: string;
    color?: string;
}) {
    const [w_account, w_account_copied] = (() => {
        switch (account) {
            case '':
                return ['?', false];
            case '0xFCAd0B19bB29D4674531d6f115237E16AfCE377c':
                return ['anonymous', false];
            default:
                return [account, true];
        }
    })();

    let opened: string | undefined = undefined;
    if (w_account_copied) {
        opened = get_evm_account_opened(chain, w_account);
    }
    return (
        <div className="ez-flex ez-items-center ez-justify-start">
            <Label title={title ?? 'Account'} />
            <div className="ez-ml-1 ez-flex ez-flex-1 ez-items-center ez-gap-x-2 ez-truncate ez-font-['JetBrainsMono'] ez-text-xs ez-font-normal ez-text-black">
                {!w_account_copied && <>{w_account}</>}
                {w_account_copied && (
                    <>
                        <div>
                            {w_account.substring(0, 12) +
                                '...' +
                                w_account.substring(w_account.length - 9)}
                        </div>
                        <Copied value={w_account} />
                        {opened && <Opened url={opened} />}
                    </>
                )}
            </div>
        </div>
    );
}

function ShowEvmContractView({ chain, contract }: { chain: EvmChain; contract: string }) {
    const [w_contract, w_contract_copied] = (() => {
        switch (contract) {
            case '':
                return ['?', false];
            default:
                return [contract, true];
        }
    })();

    let opened: string | undefined = undefined;
    if (w_contract_copied) {
        opened = get_evm_address_opened(chain, w_contract);
    }
    return (
        <div className="ez-flex ez-items-center ez-justify-start">
            <Label title="Contract" />
            <div className="ez-ml-1 ez-flex ez-items-center ez-justify-center ez-gap-x-2 ez-font-['JetBrainsMono'] ez-text-xs ez-font-normal ez-leading-snug ez-text-black">
                {!w_contract_copied && <div>{w_contract}</div>}
                {w_contract_copied && (
                    <>
                        <div>
                            {w_contract.substring(0, 12) +
                                '...' +
                                w_contract.substring(w_contract.length - 8)}
                        </div>
                        <Copied value={w_contract} />
                        {opened && <Opened url={opened} />}
                    </>
                )}
            </div>
        </div>
    );
}

function ContentEvmCallView({
    chain,
    account,
    contract,
    list,
    query_api: upper_query_api,
}: {
    chain: EvmChain;
    account: string;
    contract: string;
    list: CallingData[];
    query_api?: (anchor: ApiDataAnchor) => Promise<ApiData | undefined>;
}) {
    return (
        <div className="ez-flex ez-flex-col ez-gap-y-[6px]">
            <ShowEvmChainView chain={chain} />
            <ShowEvmAccountView chain={chain} account={account} />
            <ShowEvmContractView chain={chain} contract={contract} />
            {list.length === 1 && (
                <ContentEvmCallDataView single={true} data={list[0]} query_api={upper_query_api} />
            )}
            {list.length !== 1 && (
                <>
                    <div className="ez-mt-2 ez-border-t-2 ez-border-dotted ez-pt-2">
                        {list.map((data) => (
                            <ContentEvmCallDataView
                                key={data.id}
                                data={data}
                                query_api={upper_query_api}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function ContentEvmCallDataView({
    single,
    data,
    query_api: upper_query_api,
}: {
    single?: boolean;
    data: CallingData;
    query_api?: (anchor: ApiDataAnchor) => Promise<ApiData | undefined>;
}) {
    const [method, setMethod] = useState(
        (() => {
            if ('evm' in data.component.metadata) {
                if ('call' in data.component.metadata.evm.action) {
                    if ('api' in data.component.metadata.evm.action.call.api) {
                        if ('single' in data.component.metadata.evm.action.call.api.api) {
                            return JSON.parse(
                                data.component.metadata.evm.action.call.api.api.single.api,
                            ).name;
                        } else {
                            return data.component.metadata.evm.action.call.api.api.origin.name;
                        }
                    }
                }
            }
            return undefined;
        })(),
    );

    const [spend, setSpend] = useState(0);

    useEffect(() => {
        const d = data.data.length ? data.data[data.data.length - 1] : undefined;
        if (d && 'evm' in d.data) {
            if ('call' in d.data.evm) {
                setMethod(d.data.evm.call.method);
                if (d.end) setSpend(d.end - d.start);
            }
        }
    }, [data]);

    useEffect(() => {
        if (method) return;
        if ('evm' in data.component.metadata) {
            if ('call' in data.component.metadata.evm.action) {
                if ('anchor' in data.component.metadata.evm.action.call.api) {
                    (upper_query_api ?? query_api)(
                        data.component.metadata.evm.action.call.api.anchor,
                    ).then((api: ApiData | undefined) => {
                        if (!api) return;
                        if ('evm' in api.content) {
                            if ('single' in api.content.evm) {
                                setMethod(JSON.parse(api.content.evm.single.api).name);
                            } else {
                                setMethod(api.content.evm.origin.name);
                            }
                        }
                    });
                }
            }
        }
    }, [method, data, upper_query_api]);

    return (
        <>
            {
                <div className="ez-flex ez-items-center ez-justify-between">
                    <div className="ez-flex ez-items-center ez-justify-start">
                        <Label title={!single ? `Call #${data.id}` : 'Call'} />
                        <div className="ez-truncate ez-font-['JetBrainsMono'] ez-text-xs ez-font-normal ez-leading-snug ez-text-black">
                            {method ?? ''}
                        </div>
                    </div>

                    <div className="ez-ml-2 ez-font-['JetBrainsMono'] ez-text-xs ez-font-normal ez-text-[#999999]">
                        {spend === 0 && data.is_pending() && 'pending'}
                        {spend !== 0 && <>{spend / 1000}s</>}
                    </div>
                </div>
            }
        </>
    );
}

// ====================================== evm sign ======================================

function ContentEvmSignView({
    chain,
    account,
    message,
    data,
}: {
    chain: EvmChain;
    account: string;
    message: string;
    data: CallingData;
}) {
    return (
        <div className="easydapp-tooltip-call-item-content content-evm content-evm-sign">
            <ShowEvmChainView chain={chain} />
            <ShowEvmAccountView chain={chain} account={account} />
            <ContentEvmSignDataView message={message} data={data} />
        </div>
    );
}

function ContentEvmSignDataView({ message, data }: { message: string; data: CallingData }) {
    let spend = 0;

    const d = data.data.length ? data.data[data.data.length - 1] : undefined;
    if (d && 'evm' in d.data) {
        if ('sign' in d.data.evm) {
            message = d.data.evm.sign.message;
            if (d.end) spend = d.end - d.start;
        }
    }
    return (
        <>
            {
                <div className="ez-flex ez-flex-col ez-gap-y-[6px]">
                    <div className="ez-flex ez-items-center ez-justify-between">
                        <Label title="Sign" />
                        <div className="ez-ml-2 ez-font-['JetBrainsMono'] ez-text-xs ez-font-normal ez-text-[#999999]">
                            {spend === 0 && data.is_pending() && 'pending'}
                            {spend !== 0 && <>{spend / 1000}s</>}
                        </div>
                    </div>

                    <div className="ez-items-left ez-flex ez-w-full ez-gap-x-2 ez-font-['JetBrainsMono'] ez-text-xs ez-font-normal ez-leading-snug ez-text-black">
                        {message ?? '?'}
                        {message && <Copied value={message} />}
                    </div>
                </div>
            }
        </>
    );
}

// ====================================== evm transaction ======================================

function ContentEvmTransactionView({
    chain,
    account,
    contract,
    list,
    query_api: upper_query_api,
}: {
    chain: EvmChain;
    account: string;
    contract: string;
    list: CallingData[];
    query_api?: (anchor: ApiDataAnchor) => Promise<ApiData | undefined>;
}) {
    return (
        <div className="ez-flex ez-flex-col ez-gap-y-[6px]">
            <ShowEvmChainView chain={chain} />
            <ShowEvmAccountView chain={chain} account={account} />
            <ShowEvmContractView chain={chain} contract={contract} />
            {list.length === 1 && (
                <ContentEvmTransactionDataView
                    single={true}
                    chain={chain}
                    data={list[0]}
                    query_api={upper_query_api}
                />
            )}
            {list.length !== 1 && (
                <>
                    <div className="ez-mt-2 ez-border-t-2 ez-border-dotted ez-pt-2">
                        {list.map((data) => (
                            <ContentEvmTransactionDataView
                                key={data.id}
                                chain={chain}
                                data={data}
                                query_api={upper_query_api}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function ContentEvmTransactionDataView({
    single,
    chain,
    data,
    query_api: upper_query_api,
}: {
    single?: boolean;
    chain: EvmChain;
    data: CallingData;
    query_api?: (anchor: ApiDataAnchor) => Promise<ApiData | undefined>;
}) {
    const [method, setMethod] = useState(
        (() => {
            if ('evm' in data.component.metadata) {
                if ('call' in data.component.metadata.evm.action) {
                    if ('api' in data.component.metadata.evm.action.call.api) {
                        if ('single' in data.component.metadata.evm.action.call.api.api) {
                            return JSON.parse(
                                data.component.metadata.evm.action.call.api.api.single.api,
                            ).name;
                        } else {
                            return data.component.metadata.evm.action.call.api.api.origin.name;
                        }
                    }
                }
            }
            return undefined;
        })(),
    );

    const [tx, setTx] = useState<string>();
    const [spend, setSpend] = useState(0);

    useEffect(() => {
        const d = data.data.length ? data.data[data.data.length - 1] : undefined;
        if (d && 'evm' in d.data) {
            if ('transaction' in d.data.evm) {
                setMethod(d.data.evm.transaction.method);
                setTx(d.result);
                if (d.end) setSpend(d.end - d.start);
            }
        }
    }, [data]);

    useEffect(() => {
        if (method) return;
        if ('evm' in data.component.metadata) {
            if ('transaction' in data.component.metadata.evm.action) {
                if ('anchor' in data.component.metadata.evm.action.transaction.api) {
                    (upper_query_api ?? query_api)(
                        data.component.metadata.evm.action.transaction.api.anchor,
                    ).then((api: ApiData | undefined) => {
                        if (!api) return;
                        if ('evm' in api.content) {
                            if ('single' in api.content.evm) {
                                setMethod(JSON.parse(api.content.evm.single.api).name);
                            } else {
                                setMethod(api.content.evm.origin.name);
                            }
                        }
                    });
                }
            }
        }
    }, [method, data, upper_query_api]);
    return (
        <>
            {
                <div className="ez-flex ez-items-center ez-justify-between">
                    <div className="ez-flex ez-items-center ez-justify-start">
                        <Label title={!single ? `Transaction #${data.id}` : 'Transaction'} />
                        <div className="ez-ml-2 ez-flex ez-items-center ez-justify-center ez-font-['JetBrainsMono'] ez-text-xs ez-font-normal ez-leading-snug ez-text-black">
                            {method ?? '?'}
                        </div>
                    </div>

                    <div className="ez-ml-2 ez-font-['JetBrainsMono'] ez-text-xs ez-font-normal ez-text-[#999999]">
                        {spend === 0 && data.is_pending() && 'pending'}
                        {spend !== 0 && <>{spend / 1000}s</>}
                    </div>
                </div>
            }
            {
                <div className="ez-flex ez-items-center ez-justify-start">
                    <Label title={!single ? `Tx #${data.id}` : 'Tx'} />
                    <div className="ez-ml-1 ez-flex ez-flex-1 ez-items-center ez-gap-x-2 ez-truncate ez-font-['JetBrainsMono'] ez-text-xs ez-font-normal ez-text-black">
                        {tx ?? '?'}
                        {tx && <Copied value={tx} />}
                        {tx && <Opened url={get_evm_tx_opened(chain, tx)} />}
                    </div>
                </div>
            }
        </>
    );
}

// ====================================== evm deploy ======================================

function ContentEvmDeployView({
    chain,
    account,
    data,
}: {
    chain: EvmChain;
    account: string;
    data: CallingData;
}) {
    return (
        <div className="easydapp-tooltip-call-item-content content-evm content-evm-deploy">
            <ShowEvmChainView chain={chain} />
            <ShowEvmAccountView chain={chain} account={account} />
            <ContentEvmDeployDataView chain={chain} data={data} />
        </div>
    );
}

function ContentEvmDeployDataView({ chain, data }: { chain: EvmChain; data: CallingData }) {
    let tx: string | undefined = undefined;
    let address: string | undefined = undefined;
    let spend = 0;

    const d = data.data.length ? data.data[data.data.length - 1] : undefined;
    if (d && 'evm' in d.data) {
        if ('deploy' in d.data.evm) {
            tx = d.result.tx;
            address = d.result.address;
            if (d.end) spend = d.end - d.start;
        }
    }
    return (
        <>
            {
                <div className="ez-flex ez-items-center ez-justify-between">
                    <div className="ez-flex ez-items-center ez-justify-start">
                        <Label title="Deploy" />
                        <div className="ez-ml-1 ez-flex ez-flex-1 ez-items-center ez-gap-x-2 ez-truncate ez-font-['JetBrainsMono'] ez-text-xs ez-font-normal ez-text-black">
                            {address ?? '?'}
                            {address && <Copied value={address} />}
                            {address && <Opened url={get_evm_address_opened(chain, address)} />}
                        </div>
                    </div>

                    <div className="ez-ml-2 ez-font-['JetBrainsMono'] ez-text-xs ez-font-normal ez-text-[#999999]">
                        {spend === 0 && data.is_pending() && 'pending'}
                        {spend !== 0 && <>{spend / 1000}s</>}
                    </div>
                </div>
            }
            {
                <div className="ez-flex ez-items-center ez-justify-start">
                    <Label title="Tx" />
                    <div className="ez-ml-1 ez-flex ez-flex-1 ez-items-center ez-gap-x-2 ez-truncate ez-font-['JetBrainsMono'] ez-text-xs ez-font-normal ez-text-black">
                        {tx ?? '?'}
                        {tx && <Copied value={tx} />}
                        {tx && <Opened url={get_evm_tx_opened(chain, tx)} />}
                    </div>
                </div>
            }
        </>
    );
}

// ====================================== evm transfer ======================================

function ContentEvmTransferView({
    chain,
    account,
    transfer_to,
    list,
}: {
    chain: EvmChain;
    account: string;
    transfer_to: string;
    list: CallingData[];
}) {
    return (
        <div className="easydapp-tooltip-call-item-content content-evm content-evm-transfer">
            <ShowEvmChainView chain={chain} />
            <ShowEvmAccountView chain={chain} account={account} />
            <ShowEvmAccountView
                chain={chain}
                account={transfer_to}
                title={'To'}
                color={'text-blue-500'}
            />
            {list.length === 1 && (
                <ContentEvmTransferDataView single={true} chain={chain} data={list[0]} />
            )}
            {list.length !== 1 && (
                <>
                    <div className="ez-my-1 ez-border-b-2 ez-border-dotted"></div>
                    <div className="">
                        {list.map((data) => (
                            <ContentEvmTransferDataView key={data.id} chain={chain} data={data} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function ContentEvmTransferDataView({
    single,
    chain,
    data,
}: {
    single?: boolean;
    chain: EvmChain;
    data: CallingData;
}) {
    const pay_value: string | undefined = undefined;
    let tx: string | undefined = undefined;
    let spend = 0;

    const d = data.data.length ? data.data[data.data.length - 1] : undefined;
    if (d && 'evm' in d.data) {
        if ('call' in d.data.evm) {
            tx = d.result;
            if (d.end) spend = d.end - d.start;
        }
    }
    return (
        <>
            {
                <div className="ez-flex ez-items-center ez-justify-between">
                    <div className="ez-flex ez-items-center ez-justify-start">
                        <Label title={!single ? `Transfer #${data.id}` : 'Transfer'} />
                        <div className="ez-truncate ez-font-['JetBrainsMono'] ez-text-xs ez-font-normal ez-leading-snug ez-text-black">
                            {pay_value
                                ? `${Number(`${BigInt(pay_value) / 1000000000n}`) / 1e9} ETH`
                                : '?'}
                        </div>
                    </div>

                    <div className="ez-ml-2 ez-font-['JetBrainsMono'] ez-text-xs ez-font-normal ez-text-[#999999]">
                        {spend === 0 && data.is_pending() && 'pending'}
                        {spend !== 0 && <>{spend / 1000}s</>}
                    </div>
                </div>
            }
            {
                <div className="ez-flex ez-items-center ez-justify-start">
                    <Label title={!single ? `Tx #${data.id}` : 'Tx'} />
                    <div className="ez-ml-1 ez-flex ez-flex-1 ez-items-center ez-gap-x-2 ez-truncate ez-font-['JetBrainsMono'] ez-text-xs ez-font-normal ez-text-black">
                        {tx ?? '?'}
                        {tx && <Copied value={tx} />}
                        {tx && <Opened url={get_evm_tx_opened(chain, tx)} />}
                    </div>
                </div>
            }
        </>
    );
}
