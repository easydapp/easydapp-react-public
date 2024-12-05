import {
    query_api,
    query_code,
    query_combined,
    query_publisher,
} from '@jellypack/runtime/lib/canisters/storage/index';
import { ApiData, ApiDataAnchor } from '@jellypack/runtime/lib/store/api';
import { CodeData, CodeDataAnchor } from '@jellypack/runtime/lib/store/code';
import { Combined, CombinedAnchor } from '@jellypack/runtime/lib/store/combined';
import { DappView } from '@jellypack/runtime/lib/store/dapp';
import { Publisher, PublisherAnchor } from '@jellypack/runtime/lib/store/publisher';

export const fetch_data = async (
    dapp: DappView,
    upper_query_publisher?: (anchor: PublisherAnchor) => Promise<Publisher | undefined>,
    upper_query_code?: (anchor: CodeDataAnchor) => Promise<CodeData | undefined>,
    upper_query_api?: (anchor: ApiDataAnchor) => Promise<ApiData | undefined>,
    upper_query_combined?: (anchor: CombinedAnchor) => Promise<Combined | undefined>,
): Promise<
    [
        Combined,
        Publisher,
        [CodeDataAnchor, CodeData][],
        [ApiDataAnchor, ApiData][],
        [CombinedAnchor, Combined][],
    ]
> => {
    return Promise.all([
        (upper_query_combined ?? query_combined)(dapp.combined).then((combined) => {
            if (!combined) throw new Error(`combined not found: ${dapp.combined}`);
            return combined;
        }),
        (upper_query_publisher ?? query_publisher)(dapp.publisher).then((user) => {
            if (!user) throw new Error(`user not found: ${dapp.publisher}`);
            return user;
        }),
        Promise.all(
            (dapp.metadata?.code_anchors ?? []).map(async (code_anchor) => {
                return (upper_query_code ?? query_code)(code_anchor).then((code) => {
                    if (!code) throw new Error(`code not found: ${code_anchor}`);
                    const result: [CodeDataAnchor, CodeData] = [code_anchor, code];
                    return result;
                });
            }),
        ),
        Promise.all(
            (dapp.metadata?.apis_anchors ?? []).map(async (apis_anchor) => {
                return (upper_query_api ?? query_api)(apis_anchor).then((api) => {
                    if (!api) throw new Error(`api not found: ${apis_anchor}`);
                    const result: [ApiDataAnchor, ApiData] = [apis_anchor, api];
                    return result;
                });
            }),
        ),
        Promise.all(
            (dapp.metadata?.combined_anchors ?? []).map(async (combined_anchor) => {
                return (upper_query_combined ?? query_combined)(combined_anchor).then(
                    (combined) => {
                        if (!combined) throw new Error(`combined not found: ${combined_anchor}`);
                        const result: [CombinedAnchor, Combined] = [combined_anchor, combined];
                        return result;
                    },
                );
            }),
        ),
    ]);
};
