import { BaseConnection, executeWithLogging, _createActor } from "./baseConnection";
import ledger_idl from "../canisters/ledger.idl";
import { LEDGER_CANISTER_ID } from "../utils/constants";
export class LedgerConnection extends BaseConnection {
    identity;
    delegationIdentity;
    actor;
    agent;
    constructor(identity, delegationIdentity, actor, agent, legerCanisterId){
        super(identity, delegationIdentity, legerCanisterId ?? LEDGER_CANISTER_ID, ledger_idl, actor, agent), this.identity = identity, this.delegationIdentity = delegationIdentity, this.actor = actor, this.agent = agent;
    }
    static createConnection(identity, delegationIdentity, legerCanisterId, actor, agent) {
        return new LedgerConnection(identity, delegationIdentity, actor, agent, legerCanisterId ?? LEDGER_CANISTER_ID);
    }
    static async createActor(delegationIdentity, ledgerCanisterId, host) {
        const actor = await _createActor(ledger_idl, ledgerCanisterId ?? LEDGER_CANISTER_ID, delegationIdentity, host);
        return actor;
    }
    static async createConnectionWithII(identity, delegationIdentity, legerCanisterId) {
        const actorResult = await LedgerConnection.createActor(delegationIdentity);
        return LedgerConnection.createConnection(identity, delegationIdentity, legerCanisterId ?? LEDGER_CANISTER_ID, actorResult.actor, actorResult.agent);
    }
    static async actorGetBalance(actor, account) {
        const response = await executeWithLogging(()=>actor.account_balance_dfx({
                account
            }));
        return response.e8s;
    }
    static async actorSend(actor, { to, amount, sendOpts }) {
        const response = await executeWithLogging(()=>{
            const defaultFee = BigInt(10000);
            const defaultMemo = BigInt(Math.floor(Math.random() * 10000));
            const subAccount = sendOpts?.from_subaccount === undefined ? [] : Array.from([
                sendOpts?.from_subaccount
            ]);
            const createAtTime = sendOpts?.created_at_time === undefined ? [] : Array.from([
                {
                    timestamp_nanos: BigInt(sendOpts?.created_at_time?.getTime())
                }
            ]);
            const sendArgs = {
                to: to,
                fee: {
                    e8s: sendOpts?.fee ?? defaultFee
                },
                amount: {
                    e8s: amount
                },
                memo: sendOpts?.memo ?? defaultMemo,
                from_subaccount: subAccount,
                created_at_time: createAtTime
            };
            return actor.send_dfx(sendArgs);
        });
        return response;
    }
    async getLedgerActor(ledgerCanisterId) {
        const actor = await this._getActor(ledgerCanisterId ?? LEDGER_CANISTER_ID, ledger_idl);
        return actor;
    }
    async getBalance(account) {
        const actor = await this.getLedgerActor();
        const response = await executeWithLogging(()=>actor.account_balance_dfx({
                account
            }));
        return response.e8s;
    }
    async send({ to, amount, sendOpts }) {
        const actor = await this.getLedgerActor();
        const response = await executeWithLogging(()=>{
            const defaultFee = BigInt(10000);
            const defaultMemo = BigInt(Math.floor(Math.random() * 10000));
            const subAccount = sendOpts?.from_subaccount === undefined ? [] : Array.from([
                sendOpts?.from_subaccount
            ]);
            const createAtTime = sendOpts?.created_at_time === undefined ? [] : Array.from([
                {
                    timestamp_nanos: BigInt(sendOpts?.created_at_time?.getTime())
                }
            ]);
            const sendArgs = {
                to: to,
                fee: {
                    e8s: sendOpts?.fee ?? defaultFee
                },
                amount: {
                    e8s: amount
                },
                memo: sendOpts?.memo ?? defaultMemo,
                from_subaccount: subAccount,
                created_at_time: createAtTime
            };
            return actor.send_dfx(sendArgs);
        });
        return response;
    }
}

//# sourceMappingURL=ledgerConnection.js.map