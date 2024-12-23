import fetch from "cross-fetch";
import { NET_ID, ROSETTA_URL } from "../../utils/constants";
import { formatAssetBySymbol, parseBalance, TokenSymbol } from "../../utils/converter";
import { NNSConnection as nns } from "../../connections/nnsConnection";
export const MILI_PER_SECOND = 1_000_000;
export var RosettaTransactionStatus = /*#__PURE__*/ function(RosettaTransactionStatus) {
    RosettaTransactionStatus["COMPLETED"] = "COMPLETED";
    RosettaTransactionStatus["REVERTED"] = "REVERTED";
    RosettaTransactionStatus["PENDING"] = "PENDING";
    return RosettaTransactionStatus;
}({});
export var RosettaTransactionType = /*#__PURE__*/ function(RosettaTransactionType) {
    RosettaTransactionType["TRANSACTION"] = "TRANSACTION";
    RosettaTransactionType["FEE"] = "FEE";
    RosettaTransactionType["RECEIVE"] = "RECEIVE";
    RosettaTransactionType["SEND"] = "SEND";
    return RosettaTransactionType;
}({});
const getTransactionInfo = (accountId, rosettaTransaction)=>{
    const { operations, metadata: { timestamp: ts, block_height: bh, memo: mm, lockTime: lt }, transaction_identifier: { hash } } = rosettaTransaction;
    const transaction = {
        type: "SEND",
        details: {
            status: "COMPLETED",
            fee: {},
            from: accountId
        }
    };
    operations.forEach((operation)=>{
        const value = BigInt(operation.amount.value);
        const { decimals } = operation.amount.currency;
        const amount = parseBalance({
            value: value.toString(),
            decimals
        });
        if (operation.type === "FEE") {
            transaction.details.fee.amount = amount;
            transaction.details.fee.currency = operation.amount.currency;
            return;
        }
        if (value >= 0) transaction.details.to = operation.account.address;
        if (value <= 0) transaction.details.from = operation.account.address;
        if (transaction.details.status === "COMPLETED" && operation.status !== "COMPLETED") transaction.details.status = operation.status;
        transaction.type = transaction.details.to === accountId ? "RECEIVE" : "SEND";
        transaction.details.amount = amount;
        transaction.details.currency = operation.amount.currency;
    });
    return {
        ...transaction,
        caller: transaction.details.from,
        hash,
        timestamp: ts !== undefined ? (BigInt(ts) / BigInt(MILI_PER_SECOND)).toString() : '',
        block_height: bh !== undefined ? BigInt(bh).toString() : '',
        memo: mm !== undefined ? BigInt(mm).toString() : '',
        lockTime: lt !== undefined ? BigInt(lt).toString() : ''
    };
};
export const getICPTransactions = async (accountId)=>{
    const response = await fetch(`${ROSETTA_URL}/search/transactions`, {
        method: 'POST',
        body: JSON.stringify({
            network_identifier: NET_ID,
            account_identifier: {
                address: accountId
            }
        }),
        headers: {
            'Content-Type': 'application/json',
            Accept: '*/*'
        }
    });
    if (!response.ok) throw Error(`GET_TRANSACTIONS_FAILS: ${response.statusText}`);
    const { transactions, total_count } = await response.json();
    const transactionsInfo = transactions.map(({ transaction })=>getTransactionInfo(accountId, transaction));
    return {
        total: total_count,
        transactions: transactionsInfo
    };
};
export const getTransactions = async (localDelegationIdentity, fromAccount)=>{
    const result = await nns.getTransactions({
        delegationIdentity: localDelegationIdentity
    }, {
        page_size: 10,
        offset: 0,
        account_identifier: fromAccount
    });
    return result;
};
export const getICPTransactionsByBlock = async (fromAccount, blockHeight)=>{
    try {
        const response = await fetch(`${ROSETTA_URL}/block`, {
            method: 'POST',
            body: JSON.stringify({
                network_identifier: NET_ID,
                block_identifier: {
                    index: parseInt(blockHeight.toString())
                }
            }),
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*'
            }
        });
        if (!response.ok) throw Error(`GET_TRANSACTIONS_FAILS: ${response.statusText}`);
        const { block } = await response.json();
        const { transactions } = block;
        if (transactions === undefined || block === undefined) {
            return {
                total: transactions.length,
                transactions: []
            };
        }
        const transactionsInfo = transactions.map((transaction)=>getTransactionInfo(fromAccount, transaction));
        return {
            total: transactions.length,
            transactions: transactionsInfo
        };
    } catch (error) {
        throw error;
    }
};
export const getExactTransaction = (fromAccount, singleResponse, txns)=>{
    const { sendArgs } = singleResponse;
    const { amount, created_at_time, memo, to } = sendArgs;
    const { blockHeight } = singleResponse;
    const { transactions } = txns;
    console.log({
        singleResponse,
        txns
    });
    const found = transactions.find((val)=>{
        return created_at_time[0] !== undefined ? val.timestamp.timestamp_nanos > created_at_time[0].timestamp_nanos : true && val.block_height === blockHeight && val.memo === memo && JSON.stringify(val.transaction_type[0]) === JSON.stringify({
            Send: null
        }) && val.transfer.Send.amount.e8s === amount.e8s && val.transfer.Send.to === to;
    });
    if (found) {
        const res = {
            hash: '',
            timestamp: (BigInt(found.timestamp.timestamp_nanos) / BigInt(1000000)).toString(),
            type: "SEND",
            details: {
                to,
                from: fromAccount,
                status: "COMPLETED",
                amount: amount.e8s.toString(),
                currency: {
                    symbol: TokenSymbol.ICP,
                    decimals: 10
                },
                fee: {
                    amount: found.transfer.Send.fee.e8s.toString(),
                    currency: {
                        symbol: TokenSymbol.ICP,
                        decimals: 10
                    }
                }
            },
            caller: fromAccount,
            block_height: blockHeight.toString(),
            memo: memo.toString(),
            lockTime: ''
        };
        return res;
    }
    return undefined;
};
export const getTransactionFromRosseta = (fromAccount, singleResponse, txns)=>{
    const { sendArgs } = singleResponse;
    const { amount, created_at_time, memo, to } = sendArgs;
    const { blockHeight } = singleResponse;
    const { transactions } = txns;
    const found = transactions.find((val)=>{
        return created_at_time[0] !== undefined ? val.timestamp.length < created_at_time[0].timestamp_nanos.toString().length ? BigInt(val.timestamp) * BigInt(1000000) > created_at_time[0].timestamp_nanos : BigInt(val.timestamp) > created_at_time[0].timestamp_nanos : true && BigInt(val.block_height) === blockHeight && BigInt(val.memo) === memo && val.details.to === to && val.details.amount === formatAssetBySymbol(amount.e8s, val.details.currency.symbol)?.amount.toString() && val.caller === fromAccount;
    });
    return found;
};

//# sourceMappingURL=rosseta.js.map