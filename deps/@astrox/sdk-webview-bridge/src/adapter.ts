import * as Cbor from './cbor';
import { fromHexString, toHexString } from './util';
import { RPCError, RPCRequest, RPCResponse, RPCResult } from './rpc';

export function encodeRequest(rpc: RPCRequest): string {
  return toHexString(Cbor.encode(rpc));
}

export function decodeResponse<T>(buf: string): T {
  const decoded = Cbor.decode<RPCResponse<T>>(fromHexString(buf));
  if ((decoded as RPCError).error) {
    throw new Error(JSON.stringify((decoded as RPCError).error));
  }
  return (decoded as RPCResult<T>).result!;
}

export function rpcBuilder(method: string, ...params: any): RPCRequest {
  return {
    jsonrpc: '2.0',
    method,
    params,
    id: 0,
  };
}

export function hasOwnProperty<X extends Record<string, unknown>, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
