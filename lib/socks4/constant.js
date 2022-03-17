"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REPLIES_REP = exports.REQUEST_CMD = exports.SOCKS_NULL = exports.SOCKS_VERSION = void 0;
exports.SOCKS_VERSION = 0x04;
exports.SOCKS_NULL = 0x00;
exports.REQUEST_CMD = {
    CONNECT: 0x01,
    BIND: 0x02
};
exports.REPLIES_REP = {
    GRANTED: 0x5a,
    REJECTED: 0x5b,
    FAILED_1: 0x5c,
    FAILED_2: 0x5d
};
