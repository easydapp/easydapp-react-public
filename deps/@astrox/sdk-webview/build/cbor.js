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
import { SelfDescribeCborSerializer, value } from "simple-cbor";
var PrincipalEncoder = /*#__PURE__*/ function() {
    "use strict";
    function PrincipalEncoder() {
        _class_call_check(this, PrincipalEncoder);
    }
    _create_class(PrincipalEncoder, [
        {
            key: "name",
            get: function get() {
                return 'Principal';
            }
        },
        {
            key: "priority",
            get: function get() {
                return 0;
            }
        },
        {
            key: "match",
            value: function match(value) {
                return value && value._isPrincipal === true;
            }
        },
        {
            key: "encode",
            value: function encode(v) {
                return value.bytes(v.toUint8Array());
            }
        }
    ]);
    return PrincipalEncoder;
}();
var serializer = SelfDescribeCborSerializer.withDefaultEncoders(true);
serializer.addEncoder(new PrincipalEncoder());

//# sourceMappingURL=cbor.js.map