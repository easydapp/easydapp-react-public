import { MethodBuilder } from '@astrox/sdk-webview-bridge';
import { BalanceResponseObject, InitInfo, SupportedToken, TransactionResponseSuccess, WebViewAuthResponse } from './types';
export declare const init: MethodBuilder<InitInfo>;
export declare const connect: MethodBuilder<WebViewAuthResponse>;
export declare const isConnected: MethodBuilder<boolean>;
export declare const disconnect: MethodBuilder<void>;
export declare const signMessage: MethodBuilder<string>;
export declare const requestTransfer: MethodBuilder<TransactionResponseSuccess>;
export declare const queryBalance: MethodBuilder<BalanceResponseObject[]>;
export declare const appendAuth: MethodBuilder<WebViewAuthResponse>;
export declare const supportedStandardList: MethodBuilder<SupportedToken[]>;
