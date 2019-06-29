"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const yargs = require("yargs");
const client_1 = require("./client");
const server_1 = require("./server");
const args = yargs.argv;
const localConfigFile = path.join(__dirname, '../config.js');
const localConfig = fs.existsSync(localConfigFile)
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
