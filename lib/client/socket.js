"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const net = require("net");
const encryptor_1 = require("../encryptor");
const socks5_1 = require("../socks5");
var Status;
(function (Status) {
    Status[Status["initial"] = 0] = "initial";
    Status[Status["handshake"] = 1] = "handshake";
    Status[Status["handleDetail"] = 2] = "handleDetail";
})(Status || (Status = {}));
class Socket {
    constructor(options) {
        this.options = options;
        this.socket = options.socket;
        this.status = Status.initial;
        this.bind();
    }
    bind() {
        const socket = this.socket;
        socket.on('data', (data) => {
            if (this.status === Status.initial) {
                this.handshake(data);
            }
            if (this.status === Status.handshake) {
                this.handleDetail(data);
            }
        });
        socket.on('error', (err) => { });
        socket.on('end', () => {
            if (this.remote) {
                this.remote.end();
            }
        });
        socket.on('close', (err) => {
            if (!this.remote) {
                return;
            }
            if (err) {
                this.remote.destroy();
            }
            else {
                this.remote.end();
            }
        });
        socket.setTimeout(60 * 1000);
        socket.on('timeout', () => {
            socket.end();
        });
    }
    handshake(data) {
        const socket = this.socket;
        if (!this.isSupport(data[0])) {
            socket.end();
            return;
        }
        const nmethods = data[1];
        const authentications = new Set();
        for (let i = 0; i < nmethods; i++) {
            authentications.add(data[2 + i]);
        }
        const reply = Buffer.alloc(2);
        reply[0] = socks5_1.SOCKS_VERSION;
        if (authentications.has(socks5_1.AUTHENTICATION.NOAUTH)) {
            reply[1] = socks5_1.AUTHENTICATION.NOAUTH;
            socket.write(reply);
            this.status = Status.handshake;
        }
        else {
            reply[1] = socks5_1.AUTHENTICATION.NONE;
            socket.end(reply);
        }
    }
    handleDetail(data) {
        const socket = this.socket;
        if (!this.isSupport(data[0])) {
            socket.end();
            return;
        }
        const cmd = data[1];
        if (cmd === socks5_1.REQUEST_CMD.CONNECT && data[3]) {
            this.createRemote(data);
        }
        else {
        }
    }
    createRemote(data) {
        const { socket, options } = this;
        const encryptor = encryptor_1.default[1];
        const remote = (this.remote = net.connect(options.serverPort || 8886, options.serverHost));
        remote.on('connect', () => {
            const reply = Buffer.alloc(data.length);
            data.copy(reply);
            reply[1] = socks5_1.REPLIES_REP.SUCCEEDED;
            socket.write(reply);
            this.status = Status.handleDetail;
            remote.setNoDelay(true);
            const decipher = encryptor.getDecipher(options.password, options.iv);
            remote.pipe(decipher).pipe(socket);
            remote.write(Buffer.concat([
                Buffer.from(this.options.header + '1', 'utf8'),
                encryptor.encrypt(reply, options.password, options.iv)
            ]));
            const cipher = encryptor.getCipher(options.password, options.iv);
            socket.pipe(cipher).pipe(remote);
        });
        remote.on('error', (err) => { });
        remote.on('end', () => {
            socket.end();
        });
        remote.on('close', (err) => {
            if (err) {
                socket.destroy();
            }
            else {
                socket.end();
            }
        });
        remote.setTimeout(60 * 1000);
        remote.on('timeout', () => {
            remote.end();
        });
    }
    isSupport(version) {
        return version === socks5_1.SOCKS_VERSION;
    }
}
exports.default = Socket;
