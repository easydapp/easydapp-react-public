export class ICWindow {
    _window;
    _eventHandler;
    _removeEventListener() {
        if (this._eventHandler) {
            window.removeEventListener('message', this._eventHandler);
        }
        this._eventHandler = undefined;
    }
    _openWindow(url, target, feature) {
        this._remove();
        this._window = window.open(url, target ?? 'icWindow', feature) ?? undefined;
    }
    _remove() {
        this._window?.close();
        this._removeEventListener();
    }
}

//# sourceMappingURL=icWindow.js.map