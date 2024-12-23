import { Principal } from '@dfinity/principal';
import { AccountIdentifier, Balance, SubAccount } from './common/types';
export declare const uint8ArrayToBigInt: (array: Uint8Array) => bigint;
export declare const bigIntToUint8Array: (value: bigint) => Uint8Array;
export declare const arrayBufferToArrayOfNumber: (buffer: ArrayBuffer) => Array<number>;
export declare const arrayOfNumberToUint8Array: (numbers: Array<number>) => Uint8Array;
export declare const arrayOfNumberToArrayBuffer: (numbers: Array<number>) => ArrayBuffer;
export declare const arrayBufferToNumber: (buffer: ArrayBuffer) => number;
export declare const numberToArrayBuffer: (value: number, byteLength: number) => ArrayBuffer;
export declare const asciiStringToByteArray: (text: string) => Array<number>;
export declare const toSubAccountId: (subAccount: Array<number>) => number;
export declare const fromSubAccountId: (subAccountId: number) => Array<number>;
export declare const accountIdentifierToBytes: (accountIdentifier: AccountIdentifier) => Uint8Array;
export declare const accountIdentifierFromBytes: (accountIdentifier: Uint8Array) => AccountIdentifier;
export declare const principalToAccountIdentifier: (principal: Principal, subAccount?: Uint8Array) => string;
export declare const principalToSubAccount: (principal: Principal) => SubAccount;
export declare const stringToAccountIdentifier: (str: string) => AccountIdentifier | undefined;
export declare const calculateCrc32: (bytes: Uint8Array) => Uint8Array;
export declare const E8S_PER_ICP = 100000000;
export declare enum TokenSymbol {
    ICP = "ICP"
}
export declare const getDecimalFromSymbol: (sym: string) => number;
export interface TokenMapItem {
    [key: string]: {
        amount: number;
        symbol: string;
        balanceString: BalanceString;
    };
}
export declare const formatAssetBySymbol: (_amount: bigint, symbol: string) => {
    amount: number;
    symbol: string;
    balanceString: BalanceString;
} | undefined;
export declare const parseBalance: (balance: Balance) => string;
export declare const balanceFromString: (balance: string, decimal?: number) => bigint;
export interface BalanceString {
    total: string;
    aboveZero: string;
    belowZero: string;
    formatAboveZero: string;
}
export declare const balanceToString: (balance: bigint, decimal?: number) => BalanceString;
export declare const validateAccountId: (text: string) => boolean;
export declare const validatePrincipalId: (text: string) => boolean;
export declare const validateCanisterId: (text: string) => boolean;
export declare enum AddressType {
    PRINCIPAL = "principal",
    ACCOUNT = "accountId",
    CANISTER = "canister",
    ERC20 = "erc20",
    INVALID = "invalid"
}
export declare const getAddressType: (text: string) => AddressType.PRINCIPAL | AddressType.ACCOUNT | AddressType.CANISTER | AddressType.INVALID;
