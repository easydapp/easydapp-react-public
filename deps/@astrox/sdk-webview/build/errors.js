function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _create_class(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
export var BridgeErrors = /*#__PURE__*/ function() {
    "use strict";
    function BridgeErrors() {
        _class_call_check(this, BridgeErrors);
    }
    _create_class(BridgeErrors, null, [
        {
            key: "fromErrorCode",
            value: function fromErrorCode(code) {
                var kind = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : BridgeErrors.defaultErrorKind, message = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : BridgeErrors.defaultErrorMessage;
                var defaultReturn = {
                    kind: kind,
                    text: 'Unknown Error'
                };
                switch(code){
                    case BridgeErrors.bridgeUnknownError:
                        return {
                            kind: kind,
                            text: "Unknown Error: ".concat(message)
                        };
                    case BridgeErrors.bridgeIllegalArguments:
                        return {
                            kind: kind,
                            text: "Illegal Arguments: ".concat(message)
                        };
                    case BridgeErrors.bridgeIllegalState:
                        return {
                            kind: kind,
                            text: "Illegal State: ".concat(message)
                        };
                    case BridgeErrors.bridgeUnsupportedError:
                        return {
                            kind: kind,
                            text: "Unsupported Error: ".concat(message)
                        };
                    case BridgeErrors.bridgeIdentityNotFound:
                        return {
                            kind: kind,
                            text: "Identity Not Found: ".concat(message)
                        };
                    case BridgeErrors.bridgeIdentityExpired:
                        return {
                            kind: kind,
                            text: "Identity Expired: ".concat(message)
                        };
                    case BridgeErrors.bridgeWalletNotFound:
                        return {
                            kind: kind,
                            text: "Wallet Not Found: ".concat(message)
                        };
                    case BridgeErrors.bridgeOperationCancelled:
                        return {
                            kind: kind,
                            text: "Operation Cancelled: ".concat(message)
                        };
                    case BridgeErrors.bridgeNFTIdentifierError:
                        return {
                            kind: kind,
                            text: "NFT Identifier Error: ".concat(message)
                        };
                    case BridgeErrors.bridgeUnknownMethod:
                        return {
                            kind: kind,
                            text: "Unknown method: ".concat(message)
                        };
                    default:
                        return defaultReturn;
                }
            }
        }
    ]);
    return BridgeErrors;
}();
_define_property(BridgeErrors, "bridgeUnknownError", 50000);
_define_property(BridgeErrors, "bridgeIllegalArguments", 50001);
_define_property(BridgeErrors, "bridgeIllegalState", 50002);
_define_property(BridgeErrors, "bridgeUnsupportedError", 50003);
_define_property(BridgeErrors, "bridgeIdentityNotFound", 50004);
_define_property(BridgeErrors, "bridgeIdentityExpired", 50005);
_define_property(BridgeErrors, "bridgeWalletNotFound", 50006);
_define_property(BridgeErrors, "bridgeOperationCancelled", 50007);
_define_property(BridgeErrors, "bridgeNFTIdentifierError", 50008);
_define_property(BridgeErrors, "bridgeUnknownMethod", 50009);
_define_property(BridgeErrors, "defaultErrorKind", 'JS-SDK-Error');
_define_property(BridgeErrors, "defaultErrorMessage", 'No More Detail');

//# sourceMappingURL=errors.js.map