import {
    IncrementCombinedCall,
    IncrementDappCalledByToken,
} from '@jellypack/runtime/lib/canisters/storage';
import { ComponentId } from '@jellypack/runtime/lib/model/common/identity';
import { ExecuteEvmActionCall } from '@jellypack/runtime/lib/model/components/call/evm/action/call';
import { ExecuteEvmActionDeploy } from '@jellypack/runtime/lib/model/components/call/evm/action/deploy';
import {
    ExecuteEvmActionTransaction,
    ExecuteEvmActionTransactionEstimateGas,
} from '@jellypack/runtime/lib/model/components/call/evm/action/transaction';
import { ExecuteEvmActionTransfer } from '@jellypack/runtime/lib/model/components/call/evm/action/transfer';
import { ExecuteHttpCall } from '@jellypack/runtime/lib/model/components/call/http';
import { ExecuteIcActionCall } from '@jellypack/runtime/lib/model/components/call/ic/action/call';
import { ComponentIdentityValue } from '@jellypack/runtime/lib/model/components/identity';
import { CombinedRuntime } from '@jellypack/runtime/lib/runtime';
import { ApiData, ApiDataAnchor } from '@jellypack/runtime/lib/store/api';
import { CodeData, CodeDataAnchor } from '@jellypack/runtime/lib/store/code';
import { Combined, CombinedAnchor } from '@jellypack/runtime/lib/store/combined';
import { DappView } from '@jellypack/runtime/lib/store/dapp';
import { DappVerified } from '@jellypack/runtime/lib/store/dapp/access';
import { Publisher, PublisherAnchor } from '@jellypack/runtime/lib/store/publisher';
import { CodeExecutor, ParseFuncCandid, ParseServiceCandid } from '@jellypack/runtime/lib/wasm';
import { useCallback, useEffect, useState } from 'react';
import Icon from '../common/icon';
import { LinkComponentView } from '../components';
import { ConnectWallet } from '../connect/wallet';
import { fetch_data } from './fetch';
import { get_identity } from './identity';

export function CombinedView({
    dapp,
    verified,
    param,
    setError,
    reset,
    identity: upper_identity,
    connect_wallet,
    calling,
    onCalling,
    setRuntime: upper_set_runtime,
    query_publisher: upper_query_publisher,
    query_code: upper_query_code,
    query_api: upper_query_api,
    query_combined: upper_query_combined,
    onPublisher,
    code_executor,
    parse_service_candid,
    parse_func_candid,
    increment_combined_called,
    increment_dapp_called_by_token,
    execute_http_call,
    execute_ic_action_call,
    execute_evm_action_call,
    execute_evm_action_transaction_estimate_gas,
    execute_evm_action_transaction,
    execute_evm_action_deploy,
    execute_evm_action_transfer,
}: {
    dapp: DappView;
    verified: DappVerified;
    param: Record<string, string>;
    setError: (error?: string) => void;
    reset: number;
    identity: Record<ComponentId, ComponentIdentityValue>;
    connect_wallet: ConnectWallet;
    calling: number;
    onCalling: () => void;
    setRuntime: (runtime: CombinedRuntime) => void;
    query_publisher?: (anchor: PublisherAnchor) => Promise<Publisher | undefined>;
    query_code?: (anchor: CodeDataAnchor) => Promise<CodeData | undefined>;
    query_api?: (anchor: ApiDataAnchor) => Promise<ApiData | undefined>;
    query_combined?: (anchor: CombinedAnchor) => Promise<Combined | undefined>;
    onPublisher?: (publisher: Publisher) => void;
    code_executor?: CodeExecutor;
    parse_service_candid?: ParseServiceCandid;
    parse_func_candid?: ParseFuncCandid;
    increment_combined_called?: IncrementCombinedCall;
    increment_dapp_called_by_token?: IncrementDappCalledByToken;
    execute_http_call?: ExecuteHttpCall;
    execute_ic_action_call?: ExecuteIcActionCall;
    execute_evm_action_call?: ExecuteEvmActionCall;
    execute_evm_action_transaction_estimate_gas?: ExecuteEvmActionTransactionEstimateGas;
    execute_evm_action_transaction?: ExecuteEvmActionTransaction;
    execute_evm_action_deploy?: ExecuteEvmActionDeploy;
    execute_evm_action_transfer?: ExecuteEvmActionTransfer;
}) {
    const [loading, setLoading] = useState(false);

    const [loadingError, setLoadingError] = useState<string>();

    const [combined, setCombined] = useState<Combined>();
    const [publisher, setPublisher] = useState<Publisher>();
    const [codes, setCodes] = useState<Record<CodeDataAnchor, CodeData>>();
    const [apis, setApis] = useState<Record<ApiDataAnchor, ApiData>>();
    const [combines, setCombines] = useState<Record<CombinedAnchor, Combined>>();

    const [runtime, setRuntime] = useState<CombinedRuntime>();

    const [refresh, setRefresh] = useState(0);
    const onRefresh = () => {
        setCombined(undefined);
        setPublisher(undefined);
        setCodes(undefined);
        setApis(undefined);
        setCombines(undefined);

        setRuntime((old) => old?.stop_timer());

        setLoadingError(undefined);

        setRefresh((refresh) => refresh + 1);
    };

    // reset runtime
    useEffect(() => {
        setRuntime((old) => old?.stop_timer());

        setError(undefined);
    }, [reset, setError]);

    const [updated, setUpdated] = useState<number>(0);
    const update = useCallback(() => {
        setUpdated((updated) => updated + 1);
    }, []);
    if (runtime !== undefined) {
        runtime.set_update(update);
        runtime.set_on_error(setError);
    }

    // 1. check param
    useEffect(() => {
        for (const p of dapp.metadata?.params ?? []) {
            if (typeof param[p.name] !== 'string') {
                if (p.default === undefined) return setError(`missing param: ${p.name}`);
            }
        }
    }, [refresh, dapp, param, setError]);

    // 2. get the data required for running
    useEffect(() => {
        const start = new Date().getTime();
        setLoading(true);
        fetch_data(
            dapp,
            upper_query_publisher,
            upper_query_code,
            upper_query_api,
            upper_query_combined,
        )
            .then(([combined, publisher, codes, apis, combines]) => {
                console.error('combined', combined);
                console.error('publisher', publisher);
                console.error('codes', codes);
                console.error('apis', apis);
                console.error('combines', combines);

                const end = new Date().getTime();
                console.debug(`load app data spend:`, end - start, `ms`);
                console.debug(`combined metadata:`, combined.metadata);

                if (onPublisher) onPublisher(publisher);

                setCombined(combined);
                setPublisher(publisher);
                setCodes(Object.fromEntries(codes));
                setApis(Object.fromEntries(apis));
                setCombines(Object.fromEntries(combines));
            })
            .catch((e) => setLoadingError(e.message))
            .finally(() => setLoading(false));
    }, [
        refresh,
        dapp,
        upper_query_publisher,
        upper_query_code,
        upper_query_api,
        upper_query_combined,
        onPublisher,
    ]);

    // 3. runtime
    useEffect(() => {
        if (runtime !== undefined) return;
        if (combined === undefined) return;
        if (publisher === undefined) return;
        if (codes === undefined) return;
        if (apis === undefined) return;
        if (combines === undefined) return;

        const identity = get_identity(upper_identity, combined, connect_wallet);

        const new_runtime = new CombinedRuntime(
            dapp.id,
            verified,
            combined,
            publisher,
            codes,
            apis,
            combines,
            param,
            identity,
            update,
            onCalling,
            setError,
            {
                code_executor,
                parse_service_candid,
                parse_func_candid,
                increment_combined_called,
                increment_dapp_called_by_token,
                execute_http_call,
                execute_ic_action_call,
                execute_evm_action_call,
                execute_evm_action_transaction_estimate_gas,
                execute_evm_action_transaction,
                execute_evm_action_deploy,
                execute_evm_action_transfer,
            },
        );

        setRuntime(new_runtime);
        upper_set_runtime(new_runtime);

        new_runtime.start_clock();
        // return () => new_runtime.stop_clock();
    }, [
        refresh,
        dapp,
        verified,
        publisher,
        combined,
        codes,
        apis,
        combines,
        param,
        setError,
        upper_identity,
        connect_wallet,
        update,
        onCalling,
        upper_set_runtime,
        runtime,
        code_executor,
        parse_service_candid,
        parse_func_candid,
        increment_combined_called,
        increment_dapp_called_by_token,
        execute_http_call,
        execute_ic_action_call,
        execute_evm_action_call,
        execute_evm_action_transaction_estimate_gas,
        execute_evm_action_transaction,
        execute_evm_action_deploy,
        execute_evm_action_transfer,
    ]);

    return (
        <>
            {loading && (
                <div className="ez-mx-auto ez-flex ez-h-[734px] ez-w-full ez-flex-col ez-items-center ez-justify-center">
                    <Icon
                        name="icon-loading"
                        className="ez-h-[30px] ez-w-[30px] ez-animate-spin ez-text-black"
                    />
                    <div className="ez-mt-2 ez-font-['JetBrainsMono'] ez-text-[14px] ez-font-medium ez-text-black">
                        loading
                    </div>
                </div>
            )}

            {!loading && (
                <>
                    {loadingError && (
                        <div className="ez-flex ez-h-[734px] ez-flex-col ez-items-center ez-justify-center">
                            <Icon name="icon-ui-wrong" className="ez-h-[66px] ez-w-[66px]" />
                            <div className="ez-mt-[22px] ez-text-center ez-font-['JetBrainsMono'] ez-text-base ez-font-normal ez-leading-[18px] ez-text-black">
                                {loadingError}
                            </div>
                            <div
                                className="ez-mt-[22px] ez-flex ez-h-11 ez-w-[180px] ez-cursor-pointer ez-items-center ez-justify-center ez-rounded-[9px] ez-bg-black ez-text-center ez-font-['JetBrainsMono'] ez-text-sm ez-font-normal ez-leading-[18px] ez-text-white ez-opacity-100 hover:ez-opacity-80"
                                onClick={onRefresh}
                            >
                                Refresh
                            </div>
                        </div>
                    )}
                    {!loadingError && (
                        <>
                            {combined && publisher && codes && apis && combines && runtime && (
                                <div className="ez-m-3 ez-flex ez-h-[734px] ez-flex-col ez-gap-y-3">
                                    <InnerCombinedView
                                        runtime={runtime}
                                        updated={updated}
                                        calling={calling}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </>
    );
}

const InnerCombinedView = ({
    runtime,
    updated,
    calling,
}: {
    runtime: CombinedRuntime;
    updated: number;
    calling: number;
}) => {
    const links = runtime.links();

    return (
        <>
            {links.length > 0 &&
                links.map((link) => (
                    <LinkComponentView
                        key={link}
                        runtime={runtime}
                        link={link}
                        updated={updated}
                        calling={calling}
                    />
                ))}
        </>
    );
};
