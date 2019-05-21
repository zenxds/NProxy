"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const net = require("net");
const socket_1 = require("./socket");
class Server {
    constructor(options) {
        this.options = options;
    }
    createServer() {
        const server = net.createServer();
        server.on('connection', (socket) => {
            new socket_1.default(Object.assign({
                socket
            }, this.options));
        });
        return server;
    }
}
exports.default = Server;
