"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = __importDefault(require("net"));
const debug_1 = __importDefault(require("debug"));
const parse_1 = __importDefault(require("../parse"));
const encryptor_1 = __importDefault(require("../encryptor"));
const debug = (0, debug_1.default)('NProxy:server');
var Status;
(function (Status) {
    Status[Status["initial"] = 0] = "initial";
    Status[Status["handleData"] = 1] = "handleData";
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
                this.parse(data);
            }
        });
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
            socket.destroy();
        });
    }
    parse(data) {
        const { options, socket } = this;
        const header = options.header || '';
        if (header && data.toString('utf8', 0, header.length) !== header) {
            debug('header not match');
            socket.end();
            return;
        }
        const method = data[header.length];
        const encryptor = (this.encryptor = encryptor_1.default[method]);
        if (!encryptor) {
            debug('no encryptor');
            socket.end();
            return;
        }
        data = encryptor.decrypt(data.slice(header.length + 1), options.password, options.iv);
        const [host, port] = (0, parse_1.default)(data);
        if (!host) {
            debug('no host');
            socket.end();
            return;
        }
        this.host = host;
        this.port = port;
        this.status = Status.handleData;
        this.handleData();
    }
    handleData() {
        const { host, port, socket, options, encryptor } = this;
        socket.pause();
        debug(`connect to remote ${host}:${port}`);
        const remote = (this.remote = net_1.default.connect(port, host));
        remote.setNoDelay(true);
        remote.on('connect', () => {
            debug(`${host}:${port} socket resume`);
            socket.resume();
        });
        const decipher = encryptor.getDecipher(options.password, options.iv);
        socket.pipe(decipher).pipe(remote);
        const cipher = encryptor.getCipher(options.password, options.iv);
        remote.pipe(cipher).pipe(socket);
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
            remote.destroy();
        });
    }
}
exports.default = Socket;
