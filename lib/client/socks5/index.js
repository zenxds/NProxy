"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constant_1 = require("./constant");
const type_1 = require("../type");
var Status;
(function (Status) {
    Status[Status["initial"] = 0] = "initial";
    Status[Status["handshake"] = 1] = "handshake";
    Status[Status["handleDetail"] = 2] = "handleDetail";
})(Status || (Status = {}));
class Socks extends type_1.SocksClass {
    constructor(socket) {
        super();
        this.version = constant_1.SOCKS_VERSION;
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
    replyConnect(data) {
        const socket = this.socket;
        const reply = Buffer.alloc(data.length);
        data.copy(reply);
        reply[1] = constant_1.REPLIES_REP.SUCCEEDED;
        socket.write(reply);
        this.status = Status.handleDetail;
    }
    handshake(data) {
        const socket = this.socket;
        const nmethods = data[1];
        const authentications = new Set();
        for (let i = 0; i < nmethods; i++) {
            authentications.add(data[2 + i]);
        }
        const reply = Buffer.alloc(2);
        reply[0] = constant_1.SOCKS_VERSION;
        if (authentications.has(constant_1.AUTHENTICATION.NOAUTH)) {
            reply[1] = constant_1.AUTHENTICATION.NOAUTH;
            socket.write(reply);
            this.status = Status.handshake;
        }
        else {
            reply[1] = constant_1.AUTHENTICATION.NONE;
            socket.end(reply);
        }
    }
    handleDetail(data) {
        const cmd = data[1];
        if (cmd === constant_1.REQUEST_CMD.CONNECT) {
            this.emitConnect(data);
        }
        else {
            this.socket.end();
        }
    }
}
exports.default = Socks;
