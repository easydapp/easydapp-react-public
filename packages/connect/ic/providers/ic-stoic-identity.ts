// cSpell:disable
import { Principal } from '@dfinity/principal';
import { requestIdOf, Signature } from '@dfinity/agent';
// import { Cbor } from '@dfinity/agent';
import { SignIdentity } from '@dfinity/agent';
import { DelegationChain } from '@dfinity/identity';
import { Buffer } from 'buffer';
// window.Buffer = Buffer;
const domainSeparator = Buffer.from(new TextEncoder().encode('\x0Aic-request'));
let _stoicOrigin = 'https://www.stoicwallet.com';
// const _stoicTransportMethod = 'popup'; // New global variable for transport method
let _stoicOpenConnection = false;
let _stoicTimer: any = false;

// Identity
class PublicKey {
    _der: any;
    _type: any;
    constructor(der: any, type: any) {
        this._der = der;
        this._type = type;
    }
    getType() {
        return this._type;
    }
    toDer() {
        return this._der;
    }
}

export class StoicIdentity extends SignIdentity {
    static _transportMethod: any;
    _accounts: any;
    _publicKey: any;

    constructor(principal: any, pubkey: any, transportMethod: any) {
        super();
        StoicIdentity._transportMethod = 'popup';
        this._accounts = [];
        if (transportMethod) StoicIdentity._transportMethod = transportMethod;
        this._principal = principal;
        this._publicKey = pubkey;
    }

    static disconnect() {
        return _stoicLogout();
    }

    static connect(host?: any, transportMethod?: any) {
        if (host) _stoicOrigin = host;
        if (transportMethod) this._transportMethod = transportMethod;
        return new Promise((resolve, reject) => {
            _stoicLogin()
                .then((data: any) => {
                    const id = new StoicIdentity(
                        Principal.fromText(data.principal),
                        new PublicKey(data.key, data.type),
                        this._transportMethod,
                    );
                    resolve(id);
                })
                .catch(reject);
        });
    }

    static load(host?: any, transportMethod?: any) {
        if (host) _stoicOrigin = host;
        if (transportMethod) this._transportMethod = transportMethod;
        return new Promise((resolve) => {
            const result = _stoicInit();
            if (result === false) {
                resolve(false);
            } else {
                const id = new StoicIdentity(
                    Principal.fromText(result.principal),
                    new PublicKey(result.key, result.type),
                    this._transportMethod,
                );
                resolve(id);
            }
        });
    }

    getPublicKey() {
        return this._publicKey;
    }

    async sign(data: ArrayBuffer): Promise<Signature> {
        return this._transport(buf2hex(data)) as any;
    }

    _transport(data: any) {
        return _stoicSign(
            'sign',
            data,
            this.getPrincipal().toText(),
            StoicIdentity._transportMethod,
        );
    }

    accounts(force: any) {
        return new Promise((resolve, reject) => {
            if (!this._accounts.length || force) {
                _stoicSign(
                    'accounts',
                    'accounts',
                    this.getPrincipal().toText(),
                    StoicIdentity._transportMethod,
                )
                    .then((accounts) => {
                        this._accounts = accounts;
                        resolve(this._accounts);
                    })
                    .catch(reject);
            } else {
                resolve(this._accounts);
            }
        });
    }

    transformRequest(request: any) {
        return new Promise((resolve, reject) => {
            (async () => {
                try {
                    const { body, ...fields } = request;
                    const requestId = requestIdOf(body);
                    const pubkey = this.getPublicKey();
                    const response = {
                        ...fields,
                        body: {
                            content: body,
                        },
                    };
                    const result = JSON.parse(
                        (await _stoicSign(
                            'sign',
                            buf2hex(
                                Buffer.from(
                                    Buffer.concat([domainSeparator, new Uint8Array(requestId)]),
                                ),
                            ),
                            this.getPrincipal().toText(),
                            StoicIdentity._transportMethod,
                            request.endpoint,
                            buf2hex(requestId) as any,
                        )) as any,
                    );
                    response.body.sender_sig = hex2buf(result.signed);
                    if (pubkey.getType() == 'DelegationIdentity') {
                        const DIC = DelegationChain.fromJSON(result.chain);
                        response.body.sender_pubkey = DIC.publicKey;
                        response.body.sender_delegation = DIC.delegations;
                    } else {
                        response.body.sender_pubkey = new Uint8Array(Object.values(pubkey.toDer()));
                    }
                    resolve(response);
                } catch (e) {
                    reject(e);
                }
            })();
        });
    }
}

// Login and sign calls
let _stoicWindow: any,
    _stoicWindowCB: any,
    _stoicApiKey: any,
    _stoicApp: any,
    _listenerIndex = 0;
const _listener: any = {},
    _openConnections: any = {};
const _stoicInit = () => {
    const value = localStorage.getItem('_scApp');
    if (!value) return false;
    _stoicApp = JSON.parse(value);
    return _stoicApp ? _stoicApp : false;
};
const _stoicLogout = () => {
    localStorage.removeItem('_scApp');
    _stoicApiKey = '';
    _stoicApp = null;
};

const _stoicLogin = () => {
    return new Promise((resolve, reject) => {
        (async () => {
            const app: any = await _generateKey();
            _stoicApiKey = app.apikey;
            _stoicWindow = window.open(_stoicOrigin + '?authorizeApp', 'stoic');
            _stoicWindowCB = [
                (r: any) => {
                    app.principal = r.principal;
                    app.key = r.key;
                    app.type = r.type;
                    _stoicApp = app;
                    localStorage.setItem('_scApp', JSON.stringify(app));
                    resolve(app);
                },
                reject,
            ];
        })();
    });
};

const _stoicSign = (
    action: any,
    payload: any,
    principal: any,
    transport: any,
    endpoint = 'unknown',
    requestId = 0,
) => {
    return new Promise(function (resolve, reject) {
        (async () => {
            // Prepare the data to be sent
            const enc = new TextEncoder();
            const encdata = enc.encode(payload);
            const privk = await window.crypto.subtle.importKey(
                'jwk',
                _stoicApp.secretkey,
                {
                    name: 'ECDSA',
                    namedCurve: 'P-384',
                },
                true,
                ['sign'],
            );
            const signed = await window.crypto.subtle.sign(
                {
                    name: 'ECDSA',
                    hash: { name: 'SHA-384' },
                },
                privk,
                encdata,
            );
            const sig = buf2hex(signed);

            const data: any = {
                action: action,
                payload: payload,
                principal: principal,
                apikey: _stoicApp.apikey,
                endpoint: endpoint,
                requestId: requestId,
                sig: sig, // Include the signature in the data
            };
            if (transport === 'popup') {
                data.target = 'STOIC-POPUP';
                _postToPopup(data, resolve, reject);
            } else {
                data.target = 'STOIC-IFRAME';
                _postToFrame(data, resolve, reject);
            }
        })();
    });
};

// Private functions
async function _generateKey() {
    return new Promise((resolve) => {
        (async () => {
            const keypair = await window.crypto.subtle.generateKey(
                {
                    name: 'ECDSA',
                    namedCurve: 'P-384',
                },
                true,
                ['sign', 'verify'],
            );
            const pubk = await window.crypto.subtle.exportKey('spki', keypair.publicKey);
            const secretkey = await window.crypto.subtle.exportKey('jwk', keypair.privateKey);
            return {
                principal: '',
                key: '',
                type: '',
                secretkey: secretkey,
                apikey: buf2hex(pubk),
            };
        })().then(resolve);
    });
}

function _removeFrame(id: any) {
    if (_openConnections[id].type === 'iframe') {
        _openConnections[id].target.parentNode.removeChild(_openConnections[id].target);
    } else if (_openConnections[id].type === 'popup') {
        _openConnections[id].target.close();
    }
    delete _openConnections[id];
    delete _listener[id];
}

function _postToPopup(data: any, resolve: any, reject: any) {
    let thisIndex: any,
        existing = false;
    if (_stoicOpenConnection) {
        thisIndex = _stoicOpenConnection;
        existing = true;
        if (_stoicTimer) {
            clearTimeout(_stoicTimer);
            _stoicTimer = false;
        }
        if (data.endpoint == 'call') {
            //Keep it open?
        } else {
            _stoicTimer = setTimeout(() => {
                _stoicOpenConnection = false;
                _stoicTimer = false;
                _removeFrame(thisIndex);
            }, 5000);
        }
    }
    if (!thisIndex) {
        thisIndex = _listenerIndex;
        _listenerIndex += 1;
    }
    if (data.endpoint == 'call') {
        _stoicOpenConnection = thisIndex;
        _stoicTimer = false;
    }
    _listener[thisIndex] = [resolve, reject];
    data.listener = thisIndex;
    data.existing = existing;
    if (!existing) {
        const popup = window.open(
            `${_stoicOrigin}/?stoicTunnel&transport=popup&lid=` + thisIndex,
            'stoic_' + thisIndex,
            'width=500,height=250,left=100,top=300,toolbar=no,menubar=no,scrollbars=no,resizable=no,status=no',
        );
        if (!popup) {
            return reject('Failed to open popup window. It may have been blocked by the browser.');
        }
        _openConnections[thisIndex] = { target: popup, type: 'popup', data: data };
    } else {
        _openConnections[thisIndex].target.postMessage(data, '*');
    }
}

function _postToFrame(data: any, resolve: any, reject: any) {
    const thisIndex = _listenerIndex;
    _listenerIndex += 1;
    _listener[thisIndex] = [resolve, reject];
    const ii = document.createElement('iframe');
    ii.setAttribute('id', 'connect_iframe' + thisIndex);
    ii.setAttribute('width', '0');
    ii.setAttribute('height', '0');
    ii.setAttribute('border', '0');
    document.body.appendChild(ii);
    data.listener = thisIndex;
    _openConnections[thisIndex] = { target: ii, type: 'iframe', data: data };
    ii.addEventListener('load', function () {
        _openConnections[thisIndex].target.contentWindow.postMessage(data, '*');
    });
    ii.setAttribute('src', _stoicOrigin + '/?stoicTunnel');
}

function buf2hex(buffer: any) {
    return [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

function hex2buf(hex: any) {
    const view = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        view[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return view;
}

// const deserialize = (d) => {
//     return Cbor.decode(hex2buf(d));
// };

// const serialize = (d) => {
//     return buf2hex(Cbor.encode(d));
// };

// Message handler
window.addEventListener(
    'message',
    function (e) {
        if (e.origin == _stoicOrigin) {
            if (e && e.data) {
                if (e.data.target === 'STOIC-EXT') {
                    const [resolve, reject] = _listener[e.data.listener] || [];
                    if (typeof e.data.success !== 'undefined' && e.data.success) {
                        if (e.data.message.endpoint == 'call') {
                            //Don't close
                        } else if (e.data.message.endpoint == 'read_state') {
                            if (!e.data.message.existing) {
                                _removeFrame(e.data.listener);
                            }
                        } else {
                            _removeFrame(e.data.listener);
                        }
                        resolve(e.data.data);
                    } else {
                        reject(e.data.data);
                    }
                } else if (e.data.action === 'stoicPopupLoad') {
                    const connection = _openConnections[e.data.listener];
                    connection.target.postMessage(connection.data, '*');
                } else if (e.data.action == 'initiateStoicConnect') {
                    _stoicWindow.postMessage(
                        { action: 'requestAuthorization', apikey: _stoicApiKey },
                        '*',
                    );
                } else if (e.data.action == 'rejectAuthorization') {
                    _stoicWindowCB[1]('Authorization Rejected');
                    _stoicWindowCB = null;
                    _stoicWindow.close();
                } else if (e.data.action == 'confirmAuthorization') {
                    _stoicWindowCB[0](e.data);
                    _stoicWindowCB = null;
                    _stoicWindow.close();
                }
            }
        }
        return;
    },
    false,
);
