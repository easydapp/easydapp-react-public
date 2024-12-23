import { MethodBuilder } from "@astrox/sdk-webview-bridge";
var bridgeHandler = 'bridgeCall';
export var init = new MethodBuilder(bridgeHandler, 'init');
export var connect = new MethodBuilder(bridgeHandler, 'connect');
export var isConnected = new MethodBuilder(bridgeHandler, 'isConnected');
export var disconnect = new MethodBuilder(bridgeHandler, 'disconnect');
export var signMessage = new MethodBuilder(bridgeHandler, 'signMessage');
export var requestTransfer = new MethodBuilder(bridgeHandler, 'requestTransfer');
export var queryBalance = new MethodBuilder(bridgeHandler, 'queryBalance');
export var appendAuth = new MethodBuilder(bridgeHandler, 'appendAuth');
export var supportedStandardList = new MethodBuilder(bridgeHandler, 'supportedStandardList');

//# sourceMappingURL=methods.js.map