"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constant_1 = require("./constant");
const type_1 = require("../type");
class Socks extends type_1.SocksClass {
    constructor(socket) {
        super();
        this.version = constant_1.SOCKS_VERSION;
        this.socket = socket;
    }
    handleData(data) {
        const cmd = data[1];
        if (cmd === constant_1.REQUEST_CMD.CONNECT) {
            this.emitConnect(data);
        }
        else {
        }
    }
    replyConnect(data) {
        const socket = this.socket;
        const reply = Buffer.alloc(8);
        data.copy(reply);
        reply[0] = constant_1.SOCKS_NULL;
        reply[1] = constant_1.REPLIES_REP.GRANTED;
        socket.write(reply);
    }
}
exports.default = Socks;
