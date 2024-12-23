import { BaseConnection, executeWithLogging, _createActor } from "./baseConnection";
import nns_idl from "../canisters/nns-dapp.idl";
import nns_idl_cert from "../canisters/nns-dapp-cert.idl";
import { NNS_CANISTER_ID } from "../utils/constants";
export class NNSConnection extends BaseConnection {
    identity;
    delegationIdentity;
    actor;
    agent;
    get accountDetails() {
        return this._accountDetails;
    }
    _accountDetails;
    constructor(identity, delegationIdentity, actor, agent, nnsCanisterId){
        super(identity, delegationIdentity, nnsCanisterId ?? NNS_CANISTER_ID, nns_idl, actor, agent), this.identity = identity, this.delegationIdentity = delegationIdentity, this.actor = actor, this.agent = agent;
    }
    static createConnection(identity, delegationIdentity, actor, agent) {
        return new NNSConnection(identity, delegationIdentity, actor, agent);
    }
    static async createActor(delegationIdentity, nnsCanisterId) {
        const actor = await _createActor(nns_idl, nnsCanisterId ?? NNS_CANISTER_ID, delegationIdentity);
        return actor;
    }
    static async getTransactions({ nnsActor, delegationIdentity }, { page_size, offset, account_identifier }) {
        const actor = nnsActor ?? (await NNSConnection.createActor(delegationIdentity)).actor;
        const result = await actor.get_transactions({
            page_size,
            offset,
            account_identifier
        });
        return result;
    }
    async getNNSActor(nnsCanisterId) {
        const actor = await this._getActor(nnsCanisterId ?? NNS_CANISTER_ID, nns_idl);
        return actor;
    }
    async getNNSActorCert(nnsCanisterId) {
        const actor = await this._getActor(nnsCanisterId ?? NNS_CANISTER_ID, nns_idl_cert);
        return actor;
    }
    async getAccount(cert) {
        const actor = cert === true ? await this.getNNSActorCert() : await this.getNNSActor();
        const response = await executeWithLogging(()=>actor.get_account());
        this._accountDetails = response['Ok'];
        return response['Ok'];
    }
    async addAccount() {
        const actor = await this.getNNSActor();
        const response = await executeWithLogging(()=>actor.add_account());
        return response;
    }
}

//# sourceMappingURL=nnsConnection.js.map