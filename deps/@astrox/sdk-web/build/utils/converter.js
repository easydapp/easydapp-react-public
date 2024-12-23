import { Principal } from "@dfinity/principal";
import { sha224 } from "js-sha256";
import { Buffer } from "buffer";
import crc from "crc";
import { ALPHANUM_REGEX, CANISTER_MAX_LENGTH, SUB_ACCOUNT_BYTE_LENGTH } from "./constants";
export const uint8ArrayToBigInt = (array)=>{
    const view = new DataView(array.buffer, array.byteOffset, array.byteLength);
    if (typeof view.getBigUint64 === 'function') {
        return view.getBigUint64(0);
    } else {
        const high = BigInt(view.getUint32(0));
        const low = BigInt(view.getUint32(4));
        return (high << BigInt(32)) + low;
    }
};
const TWO_TO_THE_32 = BigInt(1) << BigInt(32);
export const bigIntToUint8Array = (value)=>{
    const array = new Uint8Array(8);
    const view = new DataView(array.buffer, array.byteOffset, array.byteLength);
    if (typeof view.setBigUint64 === 'function') {
        view.setBigUint64(0, value);
    } else {
        view.setUint32(0, Number(value >> BigInt(32)));
        view.setUint32(4, Number(value % TWO_TO_THE_32));
    }
    return array;
};
export const arrayBufferToArrayOfNumber = (buffer)=>{
    const typedArray = new Uint8Array(buffer);
    return Array.from(typedArray);
};
export const arrayOfNumberToUint8Array = (numbers)=>{
    return new Uint8Array(numbers);
};
export const arrayOfNumberToArrayBuffer = (numbers)=>{
    return arrayOfNumberToUint8Array(numbers).buffer;
};
export const arrayBufferToNumber = (buffer)=>{
    const view = new DataView(buffer);
    return view.getUint32(view.byteLength - 4);
};
export const numberToArrayBuffer = (value, byteLength)=>{
    const buffer = new ArrayBuffer(byteLength);
    new DataView(buffer).setUint32(byteLength - 4, value);
    return buffer;
};
export const asciiStringToByteArray = (text)=>{
    return Array.from(text).map((c)=>c.charCodeAt(0));
};
export const toSubAccountId = (subAccount)=>{
    const bytes = arrayOfNumberToArrayBuffer(subAccount);
    return arrayBufferToNumber(bytes);
};
export const fromSubAccountId = (subAccountId)=>{
    const buffer = numberToArrayBuffer(subAccountId, SUB_ACCOUNT_BYTE_LENGTH);
    return arrayBufferToArrayOfNumber(buffer);
};
export const accountIdentifierToBytes = (accountIdentifier)=>{
    return Uint8Array.from(Buffer.from(accountIdentifier, 'hex')).subarray(4);
};
export const accountIdentifierFromBytes = (accountIdentifier)=>{
    return Buffer.from(accountIdentifier).toString('hex');
};
export const principalToAccountIdentifier = (principal, subAccount)=>{
    const padding = asciiStringToByteArray('\x0Aaccount-id');
    const shaObj = sha224.create();
    shaObj.update([
        ...padding,
        ...principal.toUint8Array(),
        ...subAccount ?? Array(32).fill(0)
    ]);
    const hash = new Uint8Array(shaObj.array());
    const checksum = calculateCrc32(hash);
    const bytes = new Uint8Array([
        ...checksum,
        ...hash
    ]);
    return toHexString(bytes);
};
export const principalToSubAccount = (principal)=>{
    const bytes = principal.toUint8Array();
    const subAccount = new Uint8Array(32);
    subAccount[0] = bytes.length;
    subAccount.set(bytes, 1);
    return subAccount;
};
export const stringToAccountIdentifier = (str)=>{
    try {
        if (str.length === 64) {
            return str;
        }
        if (str.length === 63) {
            return principalToAccountIdentifier(Principal.fromText(str));
        }
        return undefined;
    } catch (error) {
        return undefined;
    }
};
const toHexString = (bytes)=>bytes.reduce((str, byte)=>str + byte.toString(16).padStart(2, '0'), '');
export const calculateCrc32 = (bytes)=>{
    const checksumArrayBuf = new ArrayBuffer(4);
    const view = new DataView(checksumArrayBuf);
    view.setUint32(0, crc.crc32(Buffer.from(bytes)), false);
    return Buffer.from(checksumArrayBuf);
};
export const E8S_PER_ICP = 100_000_000;
export var TokenSymbol = /*#__PURE__*/ function(TokenSymbol) {
    TokenSymbol["ICP"] = "ICP";
    return TokenSymbol;
}({});
export const getDecimalFromSymbol = (sym)=>{
    switch(sym){
        case "ICP":
            return 8;
        default:
            return 8;
    }
};
export const formatAssetBySymbol = (_amount, symbol)=>{
    const balanceString = balanceToString(_amount, getDecimalFromSymbol(symbol));
    const amount = Number(balanceString.total);
    const tokenMap = [
        {
            ICP: {
                amount: amount,
                balanceString,
                symbol: 'ICP'
            }
        }
    ];
    const found = tokenMap.find((v)=>v[symbol] !== undefined);
    return found?.[symbol];
};
export const parseBalance = (balance)=>{
    return (parseInt(balance.value, 10) / 10 ** balance.decimals).toString();
};
export const balanceFromString = (balance, decimal = 8)=>{
    const list = balance.split('.');
    const aboveZero = list[0];
    const aboveZeroBigInt = BigInt(aboveZero) * BigInt(1 * 10 ** decimal);
    let belowZeroBigInt = BigInt(0);
    const belowZero = list[1];
    if (belowZero !== undefined) {
        belowZeroBigInt = BigInt(belowZero.substring(0, decimal).padEnd(decimal, '0'));
    }
    return aboveZeroBigInt + belowZeroBigInt;
};
export const balanceToString = (balance, decimal = 8)=>{
    const balanceString = balance.toString(10);
    const balanceStringLength = balanceString.length;
    let aboveZero = '0';
    let belowZero = '0'.padEnd(decimal, '0');
    if (balanceStringLength > decimal) {
        belowZero = balanceString.substring(balanceStringLength - decimal, balanceStringLength);
        aboveZero = balanceString.substring(0, balanceStringLength - decimal);
    } else {
        belowZero = balanceString.padStart(decimal, '0');
    }
    const formatAboveZero = String(aboveZero).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return {
        total: aboveZero + '.' + belowZero,
        aboveZero,
        belowZero,
        formatAboveZero
    };
};
export const validateAccountId = (text)=>text.length === 64 && ALPHANUM_REGEX.test(text);
export const validatePrincipalId = (text)=>{
    try {
        return text === Principal.fromText(text).toString();
    } catch (e) {
        return false;
    }
};
export const validateCanisterId = (text)=>{
    try {
        return text.length <= CANISTER_MAX_LENGTH && validatePrincipalId(text);
    } catch (e) {
        return false;
    }
};
export var AddressType = /*#__PURE__*/ function(AddressType) {
    AddressType["PRINCIPAL"] = "principal";
    AddressType["ACCOUNT"] = "accountId";
    AddressType["CANISTER"] = "canister";
    AddressType["ERC20"] = "erc20";
    AddressType["INVALID"] = "invalid";
    return AddressType;
}({});
export const getAddressType = (text)=>{
    try {
        if (validateAccountId(text)) {
            return "accountId";
        } else if (validatePrincipalId(text)) {
            return "principal";
        } else if (validateCanisterId(text)) {
            return "canister";
        }
        return "invalid";
    } catch (error) {
        throw error;
    }
};

//# sourceMappingURL=converter.js.map