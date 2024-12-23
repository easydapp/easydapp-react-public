import { BaseConnection } from './baseConnection';
import LEDGER_SERVICE, { AccountIdentifier, BlockHeight, SendArgs } from '../canisters/ledger';
import { ActorSubclass, HttpAgent, SignIdentity } from '@dfinity/agent';
import { DelegationIdentity } from '@dfinity/identity';
import { CreateActorResult, SendOpts } from '../types';
export interface TransactionResponse {
    blockHeight: bigint;
    sendArgs: SendArgs;
}
export declare class LedgerConnection extends BaseConnection<LEDGER_SERVICE> {
    identity: SignIdentity;
    delegationIdentity: DelegationIdentity;
    actor?: ActorSubclass<LEDGER_SERVICE> | undefined;
    agent?: HttpAgent | undefined;
    protected constructor(identity: SignIdentity, delegationIdentity: DelegationIdentity, actor?: ActorSubclass<LEDGER_SERVICE> | undefined, agent?: HttpAgent | undefined, legerCanisterId?: string);
    /**
     * create connection
     * @param identity
     * @param delegationIdentity
     * @param legerCanisterId
     * @param actor
     * @param agent
     * @function createConnection
     * @returns {LedgerConnection}
     */
    static createConnection(identity: SignIdentity, delegationIdentity: DelegationIdentity, legerCanisterId?: string, actor?: ActorSubclass<LEDGER_SERVICE>, agent?: HttpAgent): LedgerConnection;
    /**
     * create Actor with DelegationIdentity
     * @param delegationIdentity
     * @param canisterId
     * @param ledgerCanisterId
     * @param host
     * @function {function name}
     * @returns {type} {description}
     */
    static createActor(delegationIdentity: DelegationIdentity, ledgerCanisterId?: string, host?: string): Promise<CreateActorResult<LEDGER_SERVICE>>;
    static createConnectionWithII(identity: SignIdentity, delegationIdentity: DelegationIdentity, legerCanisterId?: string): Promise<LedgerConnection>;
    static actorGetBalance(actor: ActorSubclass<LEDGER_SERVICE>, account: AccountIdentifier): Promise<bigint>;
    static actorSend(actor: ActorSubclass<LEDGER_SERVICE>, { to, amount, sendOpts, }: {
        to: AccountIdentifier;
        amount: bigint;
        sendOpts?: SendOpts;
    }): Promise<BlockHeight>;
    /**
     * get NNS Actor, used internally
     * @param canisterId
     * @param ledgerCanisterId
     * @function {function name}
     * @returns {type} {description}
     */
    getLedgerActor(ledgerCanisterId?: string): Promise<ActorSubclass<LEDGER_SERVICE>>;
    getBalance(account: AccountIdentifier): Promise<bigint>;
    send({ to, amount, sendOpts }: {
        to: AccountIdentifier;
        amount: bigint;
        sendOpts: SendOpts;
    }): Promise<BlockHeight>;
}
