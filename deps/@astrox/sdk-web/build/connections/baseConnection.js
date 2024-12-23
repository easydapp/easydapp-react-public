import { Actor, HttpAgent } from "@dfinity/agent";
import { Delegation, DelegationChain, DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity";
import { Principal } from "@dfinity/principal";
export function createConnection(identity, delegationIdentity, canisterId, interfaceFactory, actor, agent) {
    return new BaseConnection(identity, delegationIdentity, canisterId, interfaceFactory, actor, agent);
}
export const requestDelegation = async (identity, { canisterId, date })=>{
    const sessionKey = Ed25519KeyIdentity.generate();
    const chain = await DelegationChain.create(identity, sessionKey.getPublicKey(), date || new Date(Date.parse('2100-01-01')), {
        targets: canisterId != undefined ? [
            Principal.fromText(canisterId)
        ] : undefined
    });
    return DelegationIdentity.fromDelegation(sessionKey, chain);
};
export async function _createActor(interfaceFactory, canisterId, identity, host) {
    const agent = new HttpAgent({
        identity,
        host
    });
    const actor = Actor.createActor(interfaceFactory, {
        agent,
        canisterId
    });
    return {
        actor,
        agent
    };
}
export class BaseConnection {
    identity;
    delegationIdentity;
    canisterId;
    interfaceFactory;
    actor;
    agent;
    constructor(identity, delegationIdentity, canisterId, interfaceFactory, actor, agent){
        this.identity = identity;
        this.delegationIdentity = delegationIdentity;
        this.canisterId = canisterId;
        this.interfaceFactory = interfaceFactory;
        this.actor = actor;
        this.agent = agent;
    }
    async getActor() {
        throw new Error('Method not implemented.');
    }
    async _getActor(canisterId, interfaceFactory, date) {
        if (this.delegationIdentity) {
            for (const { delegation } of this.delegationIdentity.getDelegation().delegations){
                if (+new Date(Number(delegation.expiration / BigInt(1000000))) <= +Date.now()) {
                    this.actor = undefined;
                    break;
                }
            }
        }
        if (this.actor === undefined) {
            this.delegationIdentity = await requestDelegation(this.identity, {
                canisterId: this.canisterId ?? canisterId,
                date: date ?? undefined
            });
            this.actor = (await _createActor(interfaceFactory, this.canisterId ?? canisterId, this.delegationIdentity)).actor;
        }
        return this.actor;
    }
}
export async function handleDelegation(message, key) {
    const delegations = message.delegations.map((signedDelegation)=>{
        return {
            delegation: new Delegation(signedDelegation.delegation.pubkey, signedDelegation.delegation.expiration, signedDelegation.delegation.targets),
            signature: signedDelegation.signature.buffer
        };
    });
    const delegationChain = DelegationChain.fromDelegations(delegations, message.userPublicKey.buffer);
    return {
        delegationChain,
        delegationIdentity: DelegationIdentity.fromDelegation(key, delegationChain)
    };
}
export const executeWithLogging = async (func)=>{
    try {
        return await func();
    } catch (e) {
        console.log(e);
        throw e;
    }
};

//# sourceMappingURL=baseConnection.js.map