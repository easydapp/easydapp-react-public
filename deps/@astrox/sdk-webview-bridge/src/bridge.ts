// @ts-nocheck

function injectChromeBridge() {
  if (!window.top || window.top === window) {
    window._astrox_bridge_.bridgeCall = (bridgeName: string, encodedParams: string) => {
      const _callHandlerID = nextId();
      window.astrox_webview._callHandler(bridgeName, _callHandlerID, JSON.stringify([encodedParams]));
      return new Promise((resolve, _) => {
        window.astrox_webview[_callHandlerID] = resolve;
      });
    };
  } else {
    window._astrox_bridge_.bridgeCall = (bridgeName: string, encodedParams: string) => {
      const _callHandlerID = nextId();
      window.top!.astrox_webview._callHandler(bridgeName, _callHandlerID, JSON.stringify([encodedParams]));
      return new Promise((resolve, _) => {
        window.top!.astrox_webview[_callHandlerID] = resolve;
      });
    };
  }
}

function injectWebKitBridge() {
  window._astrox_bridge_.bridgeCall = (bridgeName: string, encodedParams: string) => {
    const _windowId = 'window._astrox_webview_windowId';
    const _callHandlerID = nextId();
    window.webkit.messageHandlers['callHandler'].postMessage({
      handlerName: bridgeName,
      _callHandlerID: _callHandlerID,
      args: JSON.stringify([encodedParams]),
      _windowId: _windowId,
    });

    return new Promise((resolve, _) => {
      window.astrox_webview[_callHandlerID] = resolve;
    });
  };
}

export function injectBridgeIfNeed() {
  if (window._astrox_bridge_ && window._astrox_bridge_.bridgeCall) {
    return;
  }
  if (!window._astrox_bridge_) {
    window._astrox_bridge_ = {};
  }
  if (window.webkit && window.webkit.messageHandlers) {
    injectWebKitBridge();
  } else {
    injectChromeBridge();
  }
}

export function nextId(): number {
  return setTimeout(null);
}
