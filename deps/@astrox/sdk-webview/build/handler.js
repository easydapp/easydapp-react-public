function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_without_holes(arr) {
    if (Array.isArray(arr)) return _array_like_to_array(arr);
}
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
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
function _instanceof(left, right) {
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return !!right[Symbol.hasInstance](left);
    } else {
        return left instanceof right;
    }
}
function _iterable_to_array(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _non_iterable_spread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
            symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
        }
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _object_spread_props(target, source) {
    source = source != null ? source : {};
    if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
        ownKeys(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
    }
    return target;
}
function _to_consumable_array(arr) {
    return _array_without_holes(arr) || _iterable_to_array(arr) || _unsupported_iterable_to_array(arr) || _non_iterable_spread();
}
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
function _ts_generator(thisArg, body) {
    var f, y, t, g, _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    };
    return g = {
        next: verb(0),
        "throw": verb(1),
        "return": verb(2)
    }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
    }), g;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(_)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}
import { DelegationChain } from "@dfinity/identity";
import { Actor, HttpAgent } from "@dfinity/agent";
import { isDelegationValid } from "./util";
import { ICStorage } from "./storage";
import * as _ms from "./methods";
import { TransactionMessageKind, TransactionType } from "./types";
import { AstroXIdentity } from "./identity";
import { BridgeErrors } from "./errors";
import "./cbor";
var KEY_ICSTORAGE_CACHEKEY = 'cacheKey';
var KEY_ICSTORAGE_CHAIN = 'chain';
var KEY_ICSTORAGE_WALLET = 'wallet';
var KEY_ICSTORAGE_CONFIRM = 'confirm';
var KEY_ICSTORAGE_HOST = 'host';
var KEY_CUSTOM_DOMAIN = 'customDomain';
export var AstroXWebViewHandler = /*#__PURE__*/ function() {
    "use strict";
    function AstroXWebViewHandler(_identity, _agent, _chain, _storage, _cacheKey, _wallet, _confirm, _host, _customDomain) {
        _class_call_check(this, AstroXWebViewHandler);
        var _this = this;
        _define_property(this, "_identity", void 0);
        _define_property(this, "_agent", void 0);
        _define_property(this, "_chain", void 0);
        _define_property(this, "_storage", void 0);
        _define_property(this, "_cacheKey", void 0);
        _define_property(this, "_wallet", void 0);
        _define_property(this, "_confirm", void 0);
        _define_property(this, "_host", void 0);
        _define_property(this, "_customDomain", void 0);
        _define_property(this, "principal", void 0);
        _define_property(this, "_isReady", void 0);
        _define_property(this, "config", void 0);
        _define_property(this, "createActor", void 0);
        this._identity = _identity;
        this._agent = _agent;
        this._chain = _chain;
        this._storage = _storage;
        this._cacheKey = _cacheKey;
        this._wallet = _wallet;
        this._confirm = _confirm;
        this._host = _host;
        this._customDomain = _customDomain;
        this._isReady = false;
        this.createActor = /*#__PURE__*/ function() {
            var _ref = _async_to_generator(function(canisterId, idlFactory) {
                var authed, _;
                return _ts_generator(this, function(_state) {
                    switch(_state.label){
                        case 0:
                            _this._assertEnv();
                            if (!_this._confirm) return [
                                3,
                                2
                            ];
                            _ = _this._handleWebViewConnectResponse;
                            return [
                                4,
                                _ms.appendAuth.invoke(_this._cacheKey, _this._wallet, [
                                    canisterId
                                ])
                            ];
                        case 1:
                            authed = _.apply(_this, [
                                _state.sent(),
                                _this.host,
                                _this.customDomain
                            ]);
                            if (!authed) {
                                throw new Error('User cancel authorization');
                            }
                            _state.label = 2;
                        case 2:
                            return [
                                2,
                                Actor.createActor(idlFactory, {
                                    agent: _this._agent,
                                    canisterId: canisterId
                                })
                            ];
                    }
                });
            });
            return function(canisterId, idlFactory) {
                return _ref.apply(this, arguments);
            };
        }();
        this._injectWindow();
    }
    _create_class(AstroXWebViewHandler, [
        {
            key: "setCacheKey",
            value: function setCacheKey(value) {
                this._cacheKey = value;
                this._storage.set(KEY_ICSTORAGE_CACHEKEY, value);
            }
        },
        {
            key: "cacheKey",
            get: function get() {
                return this._cacheKey;
            }
        },
        {
            key: "setWallet",
            value: function setWallet(value) {
                this._wallet = value;
                this._storage.set(KEY_ICSTORAGE_WALLET, JSON.stringify(_object_spread({}, value)));
            }
        },
        {
            key: "wallet",
            get: function get() {
                return this._wallet;
            }
        },
        {
            key: "setChain",
            value: function setChain(value) {
                this._chain = value;
                this._storage.set(KEY_ICSTORAGE_CHAIN, JSON.stringify(value === null || value === void 0 ? void 0 : value.toJSON()));
            }
        },
        {
            key: "chain",
            get: function get() {
                return this._chain;
            }
        },
        {
            key: "setConfirm",
            value: function setConfirm(value) {
                this._confirm = value;
                this._storage.set(KEY_ICSTORAGE_CONFIRM, String(value));
            }
        },
        {
            key: "confirm",
            get: function get() {
                return this._confirm;
            }
        },
        {
            key: "setIdentity",
            value: function setIdentity(value) {
                this._identity = value;
            }
        },
        {
            key: "identity",
            get: function get() {
                return this._identity;
            }
        },
        {
            key: "setAgent",
            value: function setAgent(value) {
                this._agent = value;
            }
        },
        {
            key: "setHost",
            value: function setHost(host) {
                this._host = host;
                this._storage.set(KEY_ICSTORAGE_HOST, String(host));
            }
        },
        {
            key: "setCustomDomain",
            value: function setCustomDomain(customDomain) {
                this._customDomain = customDomain;
                this._storage.set(KEY_CUSTOM_DOMAIN, String(customDomain));
            }
        },
        {
            key: "host",
            get: function get() {
                return this._host;
            }
        },
        {
            key: "customDomain",
            get: function get() {
                return this._customDomain;
            }
        },
        {
            key: "agent",
            get: function get() {
                return this._agent;
            }
        },
        {
            key: "setStorage",
            value: function setStorage(storage) {
                this._storage = storage;
            }
        },
        {
            key: "storage",
            get: function get() {
                return this._storage;
            }
        },
        {
            key: "clear",
            value: function clear() {
                this._cacheKey = undefined;
                this._confirm = undefined;
                this._chain = undefined;
                this._wallet = undefined;
                this._identity = undefined;
                this._agent = undefined;
                this._storage.remove(KEY_ICSTORAGE_CACHEKEY);
                this._storage.remove(KEY_ICSTORAGE_WALLET);
                this._storage.remove(KEY_ICSTORAGE_CHAIN);
                this._storage.remove(KEY_ICSTORAGE_CONFIRM);
                this._storage.remove(KEY_ICSTORAGE_HOST);
                this._storage.remove(KEY_CUSTOM_DOMAIN);
            }
        },
        {
            key: "_injectWindow",
            value: function _injectWindow() {
                window.icx = this;
            }
        },
        {
            key: "_initBridge",
            value: function _initBridge() {
                var _this = this;
                return _async_to_generator(function() {
                    var e;
                    return _ts_generator(this, function(_state) {
                        switch(_state.label){
                            case 0:
                                _state.trys.push([
                                    0,
                                    2,
                                    ,
                                    3
                                ]);
                                return [
                                    4,
                                    _this.fromStorage()
                                ];
                            case 1:
                                _state.sent();
                                _this._isReady = true;
                                return [
                                    3,
                                    3
                                ];
                            case 2:
                                e = _state.sent();
                                console.log('AstroXWebViewBridge occurs error:', e);
                                throw e;
                            case 3:
                                return [
                                    2
                                ];
                        }
                    });
                })();
            }
        },
        {
            key: "fromStorage",
            value: function fromStorage() {
                var _this = this;
                return _async_to_generator(function() {
                    var storage, cacheKey, connected, chainString, chain, identity, walletJson, hostString, customDomainString, _;
                    return _ts_generator(this, function(_state) {
                        switch(_state.label){
                            case 0:
                                storage = new ICStorage('astrox-');
                                return [
                                    4,
                                    storage.get(KEY_ICSTORAGE_CACHEKEY)
                                ];
                            case 1:
                                cacheKey = _state.sent();
                                _this.setStorage(storage);
                                if (!cacheKey) return [
                                    3,
                                    8
                                ];
                                return [
                                    4,
                                    _ms.isConnected.invoke(cacheKey)
                                ];
                            case 2:
                                connected = _state.sent();
                                if (!connected) {
                                    _this.clear();
                                    return [
                                        2
                                    ];
                                }
                                return [
                                    4,
                                    storage.get(KEY_ICSTORAGE_CHAIN)
                                ];
                            case 3:
                                chainString = _state.sent();
                                chain = chainString ? DelegationChain.fromJSON(chainString) : null;
                                if (!chain || !isDelegationValid(chain)) {
                                    _this.clear();
                                    return [
                                        2
                                    ];
                                }
                                identity = new AstroXIdentity(cacheKey, chain);
                                return [
                                    4,
                                    storage.get(KEY_ICSTORAGE_WALLET)
                                ];
                            case 4:
                                walletJson = _state.sent();
                                return [
                                    4,
                                    storage.get(KEY_ICSTORAGE_HOST)
                                ];
                            case 5:
                                hostString = _state.sent();
                                return [
                                    4,
                                    storage.get(KEY_CUSTOM_DOMAIN)
                                ];
                            case 6:
                                customDomainString = _state.sent();
                                _this.setHost(hostString);
                                _this.setCacheKey(cacheKey);
                                _this.setChain(chain);
                                _this.setWallet(walletJson ? JSON.parse(walletJson) : null);
                                _ = _this.setConfirm;
                                return [
                                    4,
                                    storage.get(KEY_ICSTORAGE_CONFIRM)
                                ];
                            case 7:
                                _.apply(_this, [
                                    _state.sent() == 'true'
                                ]);
                                _this.setIdentity(identity);
                                _this.setAgent(new HttpAgent({
                                    identity: identity,
                                    host: hostString !== null && hostString !== void 0 ? hostString : window.location.origin
                                }));
                                _this.setCustomDomain(customDomainString);
                                _state.label = 8;
                            case 8:
                                return [
                                    2
                                ];
                        }
                    });
                })();
            }
        },
        {
            key: "isReady",
            value: function isReady() {
                return !!window.astrox_webview && this._isReady;
            }
        },
        {
            key: "getDelegation",
            value: function getDelegation() {
                return this._chain;
            }
        },
        {
            key: "getPublicKey",
            value: function getPublicKey() {
                var _this__identity;
                return (_this__identity = this._identity) === null || _this__identity === void 0 ? void 0 : _this__identity.getPublicKey();
            }
        },
        {
            key: "getPrincipal",
            value: function getPrincipal() {
                var _this__identity;
                return (_this__identity = this._identity) === null || _this__identity === void 0 ? void 0 : _this__identity.getPrincipal();
            }
        },
        {
            key: "_assertEnv",
            value: function _assertEnv() {
                if (!this.isReady()) {
                    throw Error('Webview Bridge is not ready');
                }
            }
        },
        {
            key: "connect",
            value: function connect(params) {
                var _this = this;
                return _async_to_generator(function() {
                    return _ts_generator(this, function(_state) {
                        _this._assertEnv();
                        if (!_this.identity) {
                            return [
                                2,
                                _this.reconnect(params)
                            ];
                        }
                        return [
                            2,
                            true
                        ];
                    });
                })();
            }
        },
        {
            key: "reconnect",
            value: function reconnect(params) {
                var _this = this;
                return _async_to_generator(function() {
                    var _params_delegationTargets, delegationModes, modes, hasNotInclude, _params_customDomain, result;
                    return _ts_generator(this, function(_state) {
                        switch(_state.label){
                            case 0:
                                _this._assertEnv();
                                delegationModes = params.delegationModes;
                                if (delegationModes && delegationModes.length) {
                                    modes = [
                                        'global',
                                        'domain'
                                    ];
                                    hasNotInclude = delegationModes.some(function(v) {
                                        return !modes.includes(v);
                                    });
                                    if (hasNotInclude) {
                                        throw new Error('`delegationModes` elements only support `global` and `domain`');
                                    }
                                    delegationModes = _to_consumable_array(new Set(delegationModes));
                                }
                                return [
                                    4,
                                    _ms.connect.invoke(_object_spread_props(_object_spread({}, params), {
                                        host: (_params_customDomain = params.customDomain) !== null && _params_customDomain !== void 0 ? _params_customDomain : window.location.origin,
                                        delegationTargets: (_params_delegationTargets = params.delegationTargets) === null || _params_delegationTargets === void 0 ? void 0 : _params_delegationTargets.filter(function(value) {
                                            return typeof value === 'string' && value.trim();
                                        }),
                                        delegationModes: delegationModes
                                    }))
                                ];
                            case 1:
                                result = _state.sent();
                                return [
                                    2,
                                    _this._handleWebViewConnectResponse(result, params.host, params.customDomain)
                                ];
                        }
                    });
                })();
            }
        },
        {
            key: "_handleWebViewConnectResponse",
            value: function _handleWebViewConnectResponse(result, host, customDomain) {
                var authorized = result.authorized, payload = result.payload;
                if (!authorized) {
                    return false;
                }
                if (!payload) {
                    return true;
                }
                if (!payload.chain) {
                    return false;
                }
                var chainObject;
                try {
                    chainObject = DelegationChain.fromJSON(payload.chain);
                } catch (error) {
                    return false;
                }
                if (isDelegationValid(chainObject)) {
                    this.setChain(chainObject);
                    this.setCacheKey(payload.cacheKey);
                    this.setWallet(payload.wallet);
                    this.setIdentity(new AstroXIdentity(this._cacheKey, this._chain));
                    this.setConfirm(payload.confirm === true);
                    this.setAgent(new HttpAgent({
                        identity: this._identity,
                        host: host !== null && host !== void 0 ? host : window.location.origin
                    }));
                    this.setHost(host !== null && host !== void 0 ? host : window.location.origin);
                    this.setCustomDomain(customDomain);
                    return true;
                }
                return false;
            }
        },
        {
            key: "getSupportedTokenList",
            value: function getSupportedTokenList() {
                var _this = this;
                return _async_to_generator(function() {
                    return _ts_generator(this, function(_state) {
                        _this._assertEnv();
                        return [
                            2,
                            _ms.supportedStandardList.invoke()
                        ];
                    });
                })();
            }
        },
        {
            key: "isConnected",
            value: function isConnected() {
                var _this = this;
                return _async_to_generator(function() {
                    var _tmp;
                    return _ts_generator(this, function(_state) {
                        switch(_state.label){
                            case 0:
                                _this._assertEnv();
                                _tmp = !!_this.cacheKey;
                                if (!_tmp) return [
                                    3,
                                    2
                                ];
                                return [
                                    4,
                                    _ms.isConnected.invoke(_this.cacheKey)
                                ];
                            case 1:
                                _tmp = _state.sent();
                                _state.label = 2;
                            case 2:
                                return [
                                    2,
                                    _tmp
                                ];
                        }
                    });
                })();
            }
        },
        {
            key: "disconnect",
            value: function disconnect() {
                var _this = this;
                return _async_to_generator(function() {
                    var _tmp;
                    return _ts_generator(this, function(_state) {
                        switch(_state.label){
                            case 0:
                                _this._assertEnv();
                                _tmp = _this.cacheKey;
                                if (!_tmp) return [
                                    3,
                                    2
                                ];
                                return [
                                    4,
                                    _ms.disconnect.invoke(_this.cacheKey)
                                ];
                            case 1:
                                _tmp = _state.sent();
                                _state.label = 2;
                            case 2:
                                _tmp;
                                _this.clear();
                                return [
                                    2,
                                    true
                                ];
                        }
                    });
                })();
            }
        },
        {
            key: "signMessage",
            value: function signMessage(message) {
                return _async_to_generator(function() {
                    return _ts_generator(this, function(_state) {
                        throw new Error('Unsupported api');
                    });
                })();
            }
        },
        {
            key: "requestTransfer",
            value: function requestTransfer(req) {
                var _this = this;
                return _async_to_generator(function() {
                    var rawSendOpts, sendOpts, memo, standard, createdAtTime, txType, success, e, _JSON_parse, code, message;
                    return _ts_generator(this, function(_state) {
                        switch(_state.label){
                            case 0:
                                _this._assertEnv();
                                if (!_this.cacheKey) {
                                    return [
                                        2,
                                        BridgeErrors.fromErrorCode(BridgeErrors.bridgeIdentityNotFound, TransactionMessageKind.fail)
                                    ];
                                }
                                if (!_this._wallet) {
                                    return [
                                        2,
                                        BridgeErrors.fromErrorCode(BridgeErrors.bridgeWalletNotFound, TransactionMessageKind.fail)
                                    ];
                                }
                                rawSendOpts = req.sendOpts;
                                if (rawSendOpts) {
                                    memo = rawSendOpts.memo;
                                    if (memo) {
                                        standard = req.standard.toUpperCase();
                                        if (standard === 'EXT' && !Array.isArray(memo)) {
                                            throw new Error('`sendOpts.memo` only supports `Array<number>` type when the standard is `EXT`');
                                        }
                                        if (standard === 'ICP' && (typeof memo === "undefined" ? "undefined" : _type_of(memo)) !== 'bigint') {
                                            throw new Error('`sendOpts.memo` only supports `bigint` type when the standard is `ICP`');
                                        }
                                    }
                                    createdAtTime = rawSendOpts.created_at_time;
                                    sendOpts = _object_spread({}, rawSendOpts);
                                    if (createdAtTime) {
                                        if (_instanceof(createdAtTime, Date)) {
                                            sendOpts.created_at_time = createdAtTime.getTime();
                                        }
                                    }
                                }
                                _state.label = 1;
                            case 1:
                                _state.trys.push([
                                    1,
                                    3,
                                    ,
                                    4
                                ]);
                                txType = req.symbol !== undefined ? TransactionType.token : TransactionType.nft;
                                return [
                                    4,
                                    _ms.requestTransfer.invoke(_this.cacheKey, _object_spread_props(_object_spread({}, req), {
                                        sendOpts: sendOpts
                                    }), _this._wallet)
                                ];
                            case 2:
                                success = _state.sent();
                                switch(txType){
                                    case TransactionType.token:
                                        return [
                                            2,
                                            {
                                                kind: TransactionMessageKind.success,
                                                type: txType,
                                                payload: _object_spread_props(_object_spread({}, success), {
                                                    originPayload: req
                                                })
                                            }
                                        ];
                                    case TransactionType.nft:
                                        return [
                                            2,
                                            {
                                                kind: TransactionMessageKind.success,
                                                type: txType,
                                                payload: {
                                                    success: true,
                                                    originPayload: req
                                                }
                                            }
                                        ];
                                }
                                return [
                                    3,
                                    4
                                ];
                            case 3:
                                e = _state.sent();
                                _JSON_parse = JSON.parse(e.message), code = _JSON_parse.code, message = _JSON_parse.message;
                                return [
                                    2,
                                    BridgeErrors.fromErrorCode(code, TransactionMessageKind.fail, message)
                                ];
                            case 4:
                                return [
                                    2
                                ];
                        }
                    });
                })();
            }
        },
        {
            key: "queryBalance",
            value: function queryBalance() {
                var _this = this;
                return _async_to_generator(function() {
                    return _ts_generator(this, function(_state) {
                        switch(_state.label){
                            case 0:
                                _this._assertEnv();
                                return [
                                    4,
                                    _ms.queryBalance.invoke(_object_spread({}, _this.wallet))
                                ];
                            case 1:
                                return [
                                    2,
                                    _state.sent()
                                ];
                        }
                    });
                })();
            }
        },
        {
            key: "address",
            value: function address() {
                return _object_spread({}, this.wallet);
            }
        },
        {
            key: "init",
            value: function init() {
                var _this = this;
                return _async_to_generator(function() {
                    return _ts_generator(this, function(_state) {
                        switch(_state.label){
                            case 0:
                                return [
                                    4,
                                    _this._initBridge()
                                ];
                            case 1:
                                _state.sent();
                                _this._assertEnv();
                                return [
                                    2
                                ];
                        }
                    });
                })();
            }
        }
    ]);
    return AstroXWebViewHandler;
}();

//# sourceMappingURL=handler.js.map