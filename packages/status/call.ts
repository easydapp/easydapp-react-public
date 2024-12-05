import { ComponentId } from '@jellypack/runtime/lib/model/common/identity';
import {
    InputValue,
    match_input_value,
    refer_value_get_value,
} from '@jellypack/runtime/lib/model/common/refer';
import { match_call_metadata } from '@jellypack/runtime/lib/model/components/call';
import { match_evm_action } from '@jellypack/runtime/lib/model/components/call/evm/action';
import { match_ic_action } from '@jellypack/runtime/lib/model/components/call/ic/action';
import {
    identity_evm_metadata_get_anonymous_output_value,
    IdentityEvmOutput,
} from '@jellypack/runtime/lib/model/components/identity/evm';
import {
    identity_ic_metadata_get_anonymous_output_value,
    IdentityIcOutput,
} from '@jellypack/runtime/lib/model/components/identity/ic';
import { EvmChain } from '@jellypack/runtime/lib/model/types/evm';
import { CombinedRuntime } from '@jellypack/runtime/lib/runtime';
import { CallingData } from '@jellypack/runtime/lib/runtime/calling';

export type CallItem =
    | {
          key: string;
          http: {
              list: CallingData[]; // Together
          };
      }
    | {
          key: string;
          ic: {
              caller: string;
              canister_id: string;
              list: CallingData[]; // Together with the call of the jar
          };
      }
    | {
          key: string;
          evm_call: {
              chain: EvmChain;
              account: string;
              contract: string;
              list: CallingData[]; // The call of the same chain and contract call together
          };
      }
    | {
          key: string;
          evm_sign: {
              chain: EvmChain;
              account: string;
              message: string;
              data: CallingData; // Signature independence
          };
      }
    | {
          key: string;
          evm_transaction: {
              chain: EvmChain;
              account: string;
              contract: string;
              list: CallingData[]; // The call of the same chain and contract call together
          };
      }
    | {
          key: string;
          evm_deploy: {
              chain: EvmChain;
              account: string;
              data: CallingData; // Deploy independence
          };
      }
    | {
          key: string;
          evm_transfer: {
              chain: EvmChain;
              account: string;
              transfer_to: string;
              list: CallingData[]; // In the same chain together
          };
      };

export const count_call_item = (runtime: CombinedRuntime): CallItem[] => {
    const calls = runtime.calls().filter((id) => runtime.should_show(id));
    if (calls.length <= 7) {
        const items: CallItem[] = [];
        for (let i = 0; i < calls.length; i++)
            items.push(...inner_count_call_item([calls[i]], runtime));
        return items;
    }
    /// More than 7 merged with similar items
    return inner_count_call_item(calls, runtime);
};

const inner_count_call_item = (calls: ComponentId[], runtime: CombinedRuntime): CallItem[] => {
    const items: CallItem[] = [];
    // console.debug(`🚀 ~ calls:`, calls);
    for (const call of calls) {
        const data = runtime.get_call(call);
        // console.debug(`🚀 ~ data:`, data);

        if (!data.data.length) {
            match_call_metadata(data.component.metadata, {
                http: () => push_http(items, data),
                ic: (ic) => {
                    const identity = data.identity
                        ? runtime.find_value<IdentityIcOutput>(data.identity.id, 0)?.value
                        : identity_ic_metadata_get_anonymous_output_value();
                    // console.debug(`🚀 ~ ic identity:`, identity);
                    const caller = identity?.owner ?? '';
                    const canister_id = match_ic_action<string>(ic.action, {
                        call: (call) => read_text_input_value(call.canister_id, runtime) ?? '',
                    });
                    push_ic(items, data, caller, canister_id);
                },
                evm: (evm) => {
                    const identity = data.identity
                        ? runtime.find_value<IdentityEvmOutput>(data.identity.id, 0)?.value
                        : identity_evm_metadata_get_anonymous_output_value(evm.chain);
                    // console.debug(`🚀 ~ evm identity:`, identity);
                    match_evm_action(evm.action, {
                        call: (call) => {
                            const chain = evm.chain;
                            const account = identity?.account ?? '';
                            const contract = read_text_input_value(call.contract, runtime) ?? '';
                            push_evm_call(items, data, chain, account, contract);
                        },
                        sign: (sign) => {
                            const chain = evm.chain;
                            const account = identity?.account ?? '';
                            const message = read_text_input_value(sign, runtime) ?? '';
                            push_evm_sign(items, data, chain, account, message);
                        },
                        transaction: (transaction) => {
                            const chain = evm.chain;
                            const account = identity?.account ?? '';
                            const contract =
                                read_text_input_value(transaction.contract, runtime) ?? '';
                            push_evm_transaction(items, data, chain, account, contract);
                        },
                        deploy: () => {
                            const chain = evm.chain;
                            const account = identity?.account ?? '';
                            push_evm_deploy(items, data, chain, account);
                        },
                        transfer: (transfer) => {
                            const chain = evm.chain;
                            const account = identity?.account ?? '';
                            const transfer_to =
                                read_text_input_value(transfer.transfer_to, runtime) ?? '';
                            push_evm_transfer(items, data, chain, account, transfer_to);
                        },
                    });
                },
            });
            continue;
        }

        // Judgment type
        const d = data.data[data.data.length - 1];
        if ('http' in d.data) {
            push_http(items, data);
        } else if ('ic' in d.data) {
            const caller = d.data.ic.call.caller;
            const canister_id = d.data.ic.call.canister_id;
            push_ic(items, data, caller, canister_id);
        } else if ('evm' in d.data) {
            if ('call' in d.data.evm) {
                const chain = d.data.evm.call.chain;
                const account = d.data.evm.call.account;
                const contract = d.data.evm.call.contract;
                push_evm_call(items, data, chain, account, contract);
            } else if ('sign' in d.data.evm) {
                const chain = d.data.evm.sign.chain;
                const account = d.data.evm.sign.account;
                const message = d.data.evm.sign.message;
                push_evm_sign(items, data, chain, account, message);
            } else if ('transaction' in d.data.evm) {
                const chain = d.data.evm.transaction.chain;
                const account = d.data.evm.transaction.account;
                const contract = d.data.evm.transaction.contract;
                push_evm_transaction(items, data, chain, account, contract);
            } else if ('deploy' in d.data.evm) {
                const chain = d.data.evm.deploy.chain;
                const account = d.data.evm.deploy.account;
                push_evm_deploy(items, data, chain, account);
            } else if ('transfer' in d.data.evm) {
                const chain = d.data.evm.transfer.chain;
                const account = d.data.evm.transfer.account;
                const transfer_to = d.data.evm.transfer.transfer_to;
                push_evm_transfer(items, data, chain, account, transfer_to);
            }
        }
    }
    items.forEach((item) => {
        // Each calculation independent key
        if ('http' in item) {
            item.key = `http:[${item.http.list.map((d) => d.id).join(',')}]`;
        } else if ('ic' in item) {
            item.key = `ic:${item.ic.caller}:${item.ic.canister_id}:[${item.ic.list
                .map((d) => d.id)
                .join(',')}]`;
        } else if ('evm_call' in item) {
            item.key = `evm_call:${item.evm_call.chain}:${item.evm_call.account}:${
                item.evm_call.contract
            }:[${item.evm_call.list.map((d) => d.id).join(',')}]`;
        } else if ('evm_sign' in item) {
            item.key = `evm_sign:${item.evm_sign.chain}:${item.evm_sign.account}:${item.evm_sign.data.id}`;
        } else if ('evm_transaction' in item) {
            item.key = `evm_call:${item.evm_transaction.chain}:${item.evm_transaction.account}:${
                item.evm_transaction.contract
            }:[${item.evm_transaction.list.map((d) => d.id).join(',')}]`;
        } else if ('evm_deploy' in item) {
            item.key = `evm_deploy:${item.evm_deploy.chain}:${item.evm_deploy.account}:${item.evm_deploy.data.id}`;
        } else if ('evm_transfer' in item) {
            item.key = `evm_transfer:${item.evm_transfer.chain}:${
                item.evm_transfer.account
            }:[${item.evm_transfer.list.map((d) => d.id).join(',')}]`;
        }
    });
    return items;
};

const push_http = (items: CallItem[], data: CallingData) => {
    const item = items.find((item) => 'http' in item);
    if (item) {
        item.http.list.push(data);
    } else {
        items.push({
            key: '',
            http: {
                list: [data],
            },
        });
    }
};

const push_ic = (items: CallItem[], data: CallingData, caller: string, canister_id: string) => {
    const item = items.find(
        (item) => 'ic' in item && item.ic.caller === caller && item.ic.canister_id === canister_id,
    );
    if (item) {
        (item as any).ic.list.push(data);
    } else {
        items.push({
            key: '',
            ic: {
                caller,
                canister_id,
                list: [data],
            },
        });
    }
};

const push_evm_call = (
    items: CallItem[],
    data: CallingData,
    chain: EvmChain,
    account: string,
    contract: string,
) => {
    const item = items.find(
        (item) =>
            'evm_call' in item &&
            item.evm_call.chain === chain &&
            item.evm_call.account === account &&
            item.evm_call.contract === contract,
    );
    if (item) {
        (item as any).evm_call.list.push(data);
    } else {
        items.push({
            key: '',
            evm_call: {
                chain,
                account,
                contract,
                list: [data],
            },
        });
    }
};

const push_evm_transaction = (
    items: CallItem[],
    data: CallingData,
    chain: EvmChain,
    account: string,
    contract: string,
) => {
    const item = items.find(
        (item) =>
            'evm_transaction' in item &&
            item.evm_transaction.chain === chain &&
            item.evm_transaction.account === account &&
            item.evm_transaction.contract === contract,
    );
    if (item) {
        (item as any).evm_transaction.list.push(data);
    } else {
        items.push({
            key: '',
            evm_transaction: {
                chain,
                account,
                contract,
                list: [data],
            },
        });
    }
};

const push_evm_sign = (
    items: CallItem[],
    data: CallingData,
    chain: EvmChain,
    account: string,
    message: string,
) => {
    items.push({
        key: '',
        evm_sign: {
            chain,
            account,
            message,
            data,
        },
    });
};

const push_evm_deploy = (
    items: CallItem[],
    data: CallingData,
    chain: EvmChain,
    account: string,
) => {
    items.push({
        key: '',
        evm_deploy: {
            chain,
            account,
            data,
        },
    });
};

const push_evm_transfer = (
    items: CallItem[],
    data: CallingData,
    chain: EvmChain,
    account: string,
    transfer_to: string,
) => {
    const item = items.find(
        (item) =>
            'evm_transfer' in item &&
            item.evm_transfer.chain === chain &&
            item.evm_transfer.account === account &&
            item.evm_transfer.transfer_to === transfer_to,
    );
    if (item) {
        (item as any).evm_transfer.list.push(data);
    } else {
        items.push({
            key: '',
            evm_transfer: {
                chain,
                account,
                transfer_to,
                list: [data],
            },
        });
    }
};

export const read_text_input_value = (
    value: InputValue,
    runtime: CombinedRuntime,
): string | undefined => {
    return match_input_value<string>(value, {
        constant: (constant) => (constant as any).text,
        refer: (refer) => {
            const endpoint = refer.endpoint;
            const value = runtime.find_value(endpoint.id, endpoint.index ?? 0)?.value;
            if (value === undefined) return undefined;
            return refer_value_get_value(refer, value);
        },
    });
};

export const match_call_item = <T>(
    self: CallItem,
    {
        http,
        ic,
        evm_call,
        evm_sign,
        evm_transaction,
        evm_deploy,
        evm_transfer,
    }: {
        http: (http: {
            list: CallingData[]; // Together
        }) => T;
        ic: (ic: {
            caller: string;
            canister_id: string;
            list: CallingData[]; // Together with the call of the jar
        }) => T;
        evm_call: (evm_call: {
            chain: EvmChain;
            account: string;
            contract: string;
            list: CallingData[]; // The call of the same chain and contract call together
        }) => T;
        evm_sign: (evm_sign: {
            chain: EvmChain;
            account: string;
            message: string;
            data: CallingData; // Signature independence
        }) => T;
        evm_transaction: (evm_transaction: {
            chain: EvmChain;
            account: string;
            contract: string;
            list: CallingData[]; // The call of the same chain and contract call together
        }) => T;
        evm_deploy: (evm_deploy: {
            chain: EvmChain;
            account: string;
            data: CallingData; // Deploy independence
        }) => T;
        evm_transfer: (evm_transfer: {
            chain: EvmChain;
            account: string;
            transfer_to: string;
            list: CallingData[]; // In the same chain together
        }) => T;
    },
): T => {
    if ('http' in self) return http(self.http);
    if ('ic' in self) return ic(self.ic);
    if ('evm_call' in self) return evm_call(self.evm_call);
    if ('evm_sign' in self) return evm_sign(self.evm_sign);
    if ('evm_transaction' in self) return evm_transaction(self.evm_transaction);
    if ('evm_deploy' in self) return evm_deploy(self.evm_deploy);
    if ('evm_transfer' in self) return evm_transfer(self.evm_transfer);
    throw new Error('wrong call item');
};

export const is_call_item_doing = (item: CallItem): boolean => {
    return match_call_item(item, {
        http: (http) => http.list.some((d) => d.is_pending()),
        ic: (ic) => ic.list.some((d) => d.is_pending()),
        evm_call: (evm_call) => evm_call.list.some((d) => d.is_pending()),
        evm_sign: (evm_sign) => evm_sign.data.is_pending(),
        evm_transaction: (evm_transaction) => evm_transaction.list.some((d) => d.is_pending()),
        evm_deploy: (evm_deploy) => evm_deploy.data.is_pending(),
        evm_transfer: (evm_transfer) => evm_transfer.list.some((d) => d.is_pending()),
    });
};
