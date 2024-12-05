import { doExecuteByWasmAndCachedFactory } from '@jellypack/runtime/lib/model/components/code/by_wasm_and_cached';
import { DappMetadata } from '@jellypack/runtime/lib/store/dapp';
import { Publisher } from '@jellypack/runtime/lib/store/publisher';
import { execute_code, parse_func_candid, parse_service_candid } from '@jellypack/wasm-api';
import { useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { LinkDappView } from '../../packages/dapp';

const doExecuteByWasmAndCached = doExecuteByWasmAndCachedFactory(execute_code);

export function CombinedPage() {
    const { share_id }: { share_id?: string } = useParams();
    const location = useLocation();
    const search = location.search;

    const [dappMetadata, setDappMetadata] = useState<DappMetadata>();
    const [publisher, setPublisher] = useState<Publisher>();

    return (
        <div className="easydapp-page">
            <div className="easydapp-page-inner">
                <div className="header">
                    {dappMetadata && (
                        <h2 className="ez-h-[30px]">
                            <img src={dappMetadata.info.icon} /> <div>{dappMetadata.info.name}</div>{' '}
                            <div></div>
                        </h2>
                    )}
                    {dappMetadata && (
                        <h5 style={{ marginBlock: '0.25rem' }}> called: {dappMetadata.called} </h5>
                    )}
                    {publisher && <h4 style={{ marginBlock: '0.25rem' }}> {publisher.name} </h4>}
                </div>

                <LinkDappView
                    id={`${share_id}${search}`}
                    onDappMetadata={setDappMetadata}
                    onPublisher={setPublisher}
                    code_executor={doExecuteByWasmAndCached}
                    parse_service_candid={parse_service_candid}
                    parse_func_candid={parse_func_candid}
                />
            </div>
        </div>
    );
}
