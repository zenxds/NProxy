"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = __importDefault(require("net"));
const encryptor_1 = __importDefault(require("../encryptor"));
const socks4_1 = require("../socks4");
const socks5_1 = require("../socks5");
const socks4_2 = __importDefault(require("./socks4"));
const socks5_2 = __importDefault(require("./socks5"));
const parse_1 = __importDefault(require("../parse"));
const util_1 = require("./util");
const METHOD = 2;
class Socket {
    constructor(options) {
        this.options = options;
        this.socket = options.socket;
        this.socksMap = {
            [socks4_1.SOCKS_VERSION]: new socks4_2.default(this.socket),
            [socks5_1.SOCKS_VERSION]: new socks5_2.default(this.socket)
        };
        this.bind();
    }
    bind() {
        const { socket, socksMap } = this;
        for (const i in socksMap) {
            const socks = socksMap[i];
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
            (0, util_1.debug)('client err: %s', err.message);
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
        for (const i in socksMap) {
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
        const [host, port] = (0, parse_1.default)(data);
        const isLocal = /(localhost|127\.0\.0\.1)/.test(host);
        socket.pause();
        const remote = (this.remote = isLocal
            ? net_1.default.connect(port, host)
            : net_1.default.connect(options.serverPort || 8886, options.serverHost));
        const version = data[0];
        remote.setNoDelay(true);
        remote.on('connect', () => {
            socket.resume();
            socks.replyConnect(data);
            if (isLocal) {
                socket.pipe(remote);
                remote.pipe(socket);
                return;
            }
            const header = Buffer.from(options.header, 'utf8');
            const encryptor = encryptor_1.default[METHOD];
            if (version === socks5_1.SOCKS_VERSION) {
                const buffer = Buffer.alloc(data.length);
                data.copy(buffer);
                remote.write(Buffer.concat([
                    header,
                    Buffer.from([METHOD]),
                    encryptor.encrypt(buffer, options.password, options.iv)
                ]));
            }
            if (version === socks4_1.SOCKS_VERSION) {
                const buffer = (0, util_1.transformConnect)(data, host);
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
            (0, util_1.debug)('remote err: %s', err.message);
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
