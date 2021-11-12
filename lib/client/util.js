"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const constant_1 = require("./socks4/constant");
const constant_2 = require("./socks5/constant");
function transformConnect(data) {
    const ip = [data[4], data[5], data[6], data[7]].join('.');
    if (/^0\.0\.0\./.test(ip) &&
        data[7] !== 0 &&
        data[data.length - 1] === constant_1.SOCKS_NULL) {
        const domain = [];
        for (let i = data.length - 2; i >= 8; i--) {
            if (data[i] === constant_1.SOCKS_NULL) {
                break;
            }
            domain.unshift(data[i]);
        }
        if (domain.length) {
            return Buffer.from([
                constant_2.SOCKS_VERSION,
                0,
                0,
                constant_2.ATYP.DOMAINNAME,
                domain.length
            ]
                .concat(domain)
                .concat([
                data[2],
                data[3]
            ]));
        }
    }
    return Buffer.from([
        constant_2.SOCKS_VERSION,
        0,
        0,
        constant_2.ATYP.IP_V4,
        data[4],
        data[5],
        data[6],
        data[7],
        data[2],
        data[3]
    ]);
}
exports.transformConnect = transformConnect;
exports.debug = debug_1.default('NProxy');
