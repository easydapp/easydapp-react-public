import { RPCRequest } from '@astrox/sdk-core';
export declare function encodeRequest(rpc: RPCRequest): string;
export declare function decodeResponse<T>(buf: string): T;
export declare function rpcBuilder(method: string, ...params: any): RPCRequest;
export declare function hasOwnProperty<X extends Record<string, unknown>, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown>;
