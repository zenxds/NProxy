"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socks4_1 = require("../../socks4");
const type_1 = require("../type");
class Socks extends type_1.SocksClass {
    constructor(socket) {
        super();
        this.version = socks4_1.SOCKS_VERSION;
        this.socket = socket;
    }
    handleData(data) {
        const cmd = data[1];
        if (cmd === socks4_1.REQUEST_CMD.CONNECT) {
            this.emitConnect(data);
        }
        else {
        }
    }
    replyConnect(data) {
        const socket = this.socket;
        const reply = Buffer.alloc(8);
        data.copy(reply);
        reply[0] = socks4_1.SOCKS_NULL;
        reply[1] = socks4_1.REPLIES_REP.GRANTED;
        socket.write(reply);
    }
}
exports.default = Socks;
