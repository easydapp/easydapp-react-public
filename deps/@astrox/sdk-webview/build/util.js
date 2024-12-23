export function isDelegationValid(chain) {
    if (!chain || !(chain === null || chain === void 0 ? void 0 : chain.delegations)) {
        return false;
    }
    var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
    try {
        for(var _iterator = chain.delegations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
            var delegation = _step.value.delegation;
            if (parseInt(delegation.expiration, 16) / 1e6 <= +Date.now()) {
                return false;
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally{
        try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
            }
        } finally{
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
    return true;
}

//# sourceMappingURL=util.js.map