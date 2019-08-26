"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const yargs_1 = __importDefault(require("yargs"));
const client_1 = __importDefault(require("./client"));
const server_1 = __importDefault(require("./server"));
const args = yargs_1.default.argv;
const localConfigFile = path_1.default.join(__dirname, '../config.js');
const localConfig = fs_1.default.existsSync(localConfigFile)
    ? require(localConfigFile)
    : {};
if (args.c) {
    const config = Object.assign({
        serverHost: '',
        serverPort: 8886,
        clientPort: 1113,
        password: '',
        iv: '',
        header: ''
    }, localConfig.client || {});
    const client = new client_1.default(config);
    const service = client.createServer();
    service.listen(config.clientPort, '0.0.0.0', () => {
        console.log('client is running at ' + config.clientPort);
    });
}
if (args.s) {
    const config = Object.assign({
        port: 8886,
        password: '',
        iv: '',
        header: ''
    }, localConfig.server || {});
    const server = new server_1.default(config);
    const service = server.createServer();
    service.listen(config.port, '0.0.0.0', () => {
        console.log('server is running at ' + config.port);
    });
}
