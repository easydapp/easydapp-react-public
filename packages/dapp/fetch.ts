import {
    query_dapp_access_by_id,
    query_dapp_by_token,
} from '@jellypack/runtime/lib/canisters/storage';
import { DappView } from '@jellypack/runtime/lib/store/dapp';
import { DappAccessView, DappVerified } from '@jellypack/runtime/lib/store/dapp/access';

export const fetch_dapp_access = async (
    share_id: string,
    query_dapp_access?: (id: string) => Promise<DappAccessView | undefined>,
): Promise<DappAccessView> => {
    const access = await (query_dapp_access ?? query_dapp_access_by_id)(share_id);
    if (access === undefined) throw new Error(`can not find dapp access by ${share_id}`);
    return access;
};

export const fetch_dapp = async (
    share_id: string,
    verified?: DappVerified,
    query_dapp?: (id: string, verified?: DappVerified) => Promise<DappView | undefined>,
): Promise<DappView> => {
    const dapp = await (query_dapp ?? query_dapp_by_token)(share_id, verified);
    if (dapp === undefined) throw new Error(`can not find dapp by ${share_id}`);
    if (dapp.frozen !== undefined) throw new Error(`dapp is frozen: ${share_id}`);
    return dapp;
};
