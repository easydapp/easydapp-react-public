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
export var ICStorage = /*#__PURE__*/ function() {
    "use strict";
    function ICStorage() {
        var prefix = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 'astrox-', _localStorage = arguments.length > 1 ? arguments[1] : void 0;
        _class_call_check(this, ICStorage);
        _define_property(this, "prefix", void 0);
        _define_property(this, "_localStorage", void 0);
        this.prefix = prefix;
        this._localStorage = _localStorage;
    }
    _create_class(ICStorage, [
        {
            key: "get",
            value: function get(key) {
                return Promise.resolve(this._getICStorage().getItem(this.prefix + key));
            }
        },
        {
            key: "set",
            value: function set(key, value) {
                this._getICStorage().setItem(this.prefix + key, value);
                return Promise.resolve();
            }
        },
        {
            key: "remove",
            value: function remove(key) {
                this._getICStorage().removeItem(this.prefix + key);
                return Promise.resolve();
            }
        },
        {
            key: "_getICStorage",
            value: function _getICStorage() {
                if (this._localStorage) {
                    return this._localStorage;
                }
                var ls = typeof window === 'undefined' ? typeof global === 'undefined' ? typeof self === 'undefined' ? undefined : self.localStorage : global.localStorage : window.localStorage;
                if (!ls) {
                    throw new Error('Could not find local storage.');
                }
                return ls;
            }
        }
    ]);
    return ICStorage;
}();

//# sourceMappingURL=storage.js.map