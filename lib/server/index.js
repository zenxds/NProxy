"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = __importDefault(require("net"));
const socket_1 = __importDefault(require("./socket"));
class Server {
    constructor(options) {
        this.options = options;
    }
    createServer() {
        const server = net_1.default.createServer();
        server.on('connection', (socket) => {
            new socket_1.default(Object.assign({
                socket
            }, this.options));
        });
        return server;
    }
}
exports.default = Server;
