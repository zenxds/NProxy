"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOCKS_VERSION = 0x04;
exports.SOCKS_NULL = 0x00;
exports.REQUEST_CMD = {
    CONNECT: 0x01,
    BIND: 0x02
};
exports.REPLIES_REP = {
    GRANTED: 0x5A,
    REJECTED: 0x5B,
    FAILED_1: 0x5C,
    FAILED_2: 0x5D
};
