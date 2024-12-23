import { HttpAgentRequest, PublicKey, requestIdOf, Signature, SignIdentity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { fromHexString, toHexString } from '@astrox/sdk-webview-bridge';
import * as _ms from './methods';
import { DelegationChain } from '@dfinity/identity';

export class AstroXIdentity extends SignIdentity {
  #principal?: Principal;

  constructor(private _cacheKey: string, private _chain: DelegationChain) {
    super();
  }

  public getPublicKey(): PublicKey {
    return {
      toDer: () => this._chain.publicKey,
    };
  }

  public getPrincipal(): Principal {
    if (!this.#principal) {
      this.#principal = Principal.selfAuthenticating(new Uint8Array(this.getPublicKey().toDer()));
    }
    return this.#principal;
  }

  async sign(blob: ArrayBuffer): Promise<Signature> {
    try {
      const hex = toHexString(blob);
      const signedResponse = await _ms.signMessage.invoke(this._cacheKey, hex);
      return fromHexString(signedResponse) as Signature;
    } catch (error) {
      throw new Error(`signing message error: ${(error as Error).message}`);
    }
  }

  public async transformRequest(request: HttpAgentRequest): Promise<unknown> {
    const { body, ...fields } = request;
    const requestId = await requestIdOf(body);
    const requestDomainSeparator = new TextEncoder().encode('\x0Aic-request');
    return {
      ...fields,
      body: {
        content: body,
        sender_sig: await this.sign(new Uint8Array([...requestDomainSeparator, ...new Uint8Array(requestId)])),
        sender_delegation: this._chain.delegations,
        sender_pubkey: this._chain.publicKey,
      },
    };
  }
}
