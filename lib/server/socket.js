"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const net = require("net");
const parse_1 = require("../parse");
const encrypt_1 = require("../encrypt");
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
                this.handleData();
            }
        });
        socket.on('error', err => { });
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
    parse(data) {
        const { options } = this;
        data = encrypt_1.decrypt(data, options.password, options.iv);
        const [host, port] = parse_1.default(data);
        this.host = host;
        this.port = port;
        this.status = Status.handleData;
    }
    handleData() {
        const { host, port, socket, options } = this;
        const remote = (this.remote = net.connect(port, host));
        remote.setNoDelay(true);
        const decipher = encrypt_1.getDecipher(options.password, options.iv);
        socket.pipe(decipher).pipe(remote);
        const cipher = encrypt_1.getCipher(options.password, options.iv);
        remote.pipe(cipher).pipe(socket);
        remote.on('error', err => { });
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
}
exports.default = Socket;
