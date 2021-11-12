"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = __importDefault(require("net"));
const encryptor_1 = __importDefault(require("../encryptor"));
const constant_1 = require("./socks4/constant");
const constant_2 = require("./socks5/constant");
const socks4_1 = __importDefault(require("./socks4"));
const socks5_1 = __importDefault(require("./socks5"));
const util_1 = require("./util");
const METHOD = 2;
class Socket {
    constructor(options) {
        this.options = options;
        this.socket = options.socket;
        this.socksMap = {
            [constant_1.SOCKS_VERSION]: new socks4_1.default(this.socket),
            [constant_2.SOCKS_VERSION]: new socks5_1.default(this.socket)
        };
        this.bind();
    }
    bind() {
        const { socket, socksMap } = this;
        for (let i in socksMap) {
            let socks = socksMap[i];
            socks.once('connect', (data) => {
                this.connectRemote(data, socks);
            });
        }
        socket.setNoDelay(true);
        socket.on('data', (data) => {
            if (this.remote) {
                return;
            }
            const version = data[0];
            if (socksMap[version]) {
                socksMap[version].handleData(data);
            }
            else {
                this.end(socket, true);
            }
        });
        socket.on('error', (err) => {
            util_1.debug('client err: %s', err.message);
        });
        socket.on('end', () => {
            this.unbind();
            this.end(this.remote);
        });
        socket.on('close', (err) => {
            this.unbind();
            this.end(this.remote, err);
        });
        socket.setTimeout(60 * 1000);
        socket.on('timeout', () => {
            this.end(socket, true);
        });
    }
    unbind() {
        const { socksMap } = this;
        for (let i in socksMap) {
            socksMap[i].removeAllListeners();
        }
    }
    end(socket, err) {
        if (!socket || socket.destroyed) {
            return;
        }
        if (err) {
            socket.destroy();
        }
        else {
            socket.end();
        }
    }
    connectRemote(data, socks) {
        const { socket, options } = this;
        socket.pause();
        const remote = (this.remote = net_1.default.connect(options.serverPort || 8886, options.serverHost));
        const version = data[0];
        remote.setNoDelay(true);
        remote.on('connect', () => {
            socket.resume();
            socks.replyConnect(data);
            const header = Buffer.from(options.header, 'utf8');
            const encryptor = encryptor_1.default[METHOD];
            if (version === constant_2.SOCKS_VERSION) {
                const buffer = Buffer.alloc(data.length);
                data.copy(buffer);
                remote.write(Buffer.concat([
                    header,
                    Buffer.from([METHOD]),
                    encryptor.encrypt(buffer, options.password, options.iv)
                ]));
            }
            if (version === constant_1.SOCKS_VERSION) {
                const buffer = util_1.transformConnect(data);
                remote.write(Buffer.concat([
                    header,
                    Buffer.from([METHOD]),
                    encryptor.encrypt(buffer, options.password, options.iv)
                ]));
            }
            const decipher = encryptor.getDecipher(options.password, options.iv);
            remote.pipe(decipher).pipe(socket);
            const cipher = encryptor.getCipher(options.password, options.iv);
            socket.pipe(cipher).pipe(remote);
        });
        remote.on('error', (err) => {
            util_1.debug('remote err: %s', err.message);
        });
        remote.on('end', () => {
            this.end(socket);
        });
        remote.on('close', (err) => {
            this.end(socket, err);
        });
        remote.setTimeout(60 * 1000);
        remote.on('timeout', () => {
            this.end(remote, true);
        });
    }
}
exports.default = Socket;
