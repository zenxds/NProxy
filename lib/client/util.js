"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.debug = exports.transformConnect = exports.isIP = void 0;
const debug_1 = __importDefault(require("debug"));
const socks5_1 = require("../socks5");
function isIP(host) {
    return /\d+\.\d+\.\d+\.\d+/.test(host);
}
exports.isIP = isIP;
function transformConnect(data, host) {
    if (isIP(host)) {
        return Buffer.from([
            socks5_1.SOCKS_VERSION,
            0,
            0,
            socks5_1.ATYP.IP_V4,
            data[4],
            data[5],
            data[6],
            data[7],
            data[2],
            data[3]
        ]);
    }
    return Buffer.from([
        socks5_1.SOCKS_VERSION,
        0,
        0,
        socks5_1.ATYP.DOMAINNAME,
        host.length
    ]
        .concat(Array.from(Buffer.from(host)))
        .concat([
        data[2],
        data[3]
    ]));
}
exports.transformConnect = transformConnect;
exports.debug = (0, debug_1.default)('NProxy');
