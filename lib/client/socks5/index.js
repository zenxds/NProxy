"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dns_1 = __importDefault(require("dns"));
const util_1 = require("util");
const socks5_1 = require("../../socks5");
const type_1 = require("../type");
const lookup = (0, util_1.promisify)(dns_1.default.lookup);
var Status;
(function (Status) {
    Status[Status["initial"] = 0] = "initial";
    Status[Status["handshake"] = 1] = "handshake";
    Status[Status["handleDetail"] = 2] = "handleDetail";
})(Status || (Status = {}));
class Socks extends type_1.SocksClass {
    constructor(socket) {
        super();
        this.version = socks5_1.SOCKS_VERSION;
        this.status = Status.initial;
        this.socket = socket;
    }
    handleData(data) {
        if (this.status === Status.initial) {
            this.handshake(data);
        }
        else if (this.status === Status.handshake) {
            this.handleDetail(data);
        }
    }
    handshake(data) {
        const socket = this.socket;
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
    async replyConnect(data) {
        const socket = this.socket;
        const [host, port] = (0, socks5_1.parse)(data);
        let ip = '';
        if (data[3] === socks5_1.ATYP.DOMAINNAME) {
            try {
                const lookupAddress = await lookup(host, { family: 4 });
                ip = lookupAddress.address;
            }
            catch (err) { }
        }
        else if (data[3] === socks5_1.ATYP.IP_V4) {
            ip = host;
        }
        const reply = Buffer.alloc(ip ? 10 : data.length);
        data.copy(reply);
        reply[1] = socks5_1.REPLIES_REP.SUCCEEDED;
        if (ip) {
            reply[3] = socks5_1.ATYP.IP_V4;
            const arr = ip.split('.');
            reply[4] = parseInt(arr[0]);
            reply[5] = parseInt(arr[1]);
            reply[6] = parseInt(arr[2]);
            reply[7] = parseInt(arr[3]);
            reply[8] = port >> 8;
            reply[9] = port & 0xff;
        }
        socket.write(reply);
        this.status = Status.handleDetail;
    }
    handleDetail(data) {
        const cmd = data[1];
        if (cmd === socks5_1.REQUEST_CMD.CONNECT) {
            this.emitConnect(data);
        }
        else {
            this.socket.end();
        }
    }
}
exports.default = Socks;
