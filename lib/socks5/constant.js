"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REPLIES_REP = exports.ATYP = exports.REQUEST_CMD = exports.AUTHENTICATION = exports.SOCKS_VERSION = void 0;
exports.SOCKS_VERSION = 0x05;
exports.AUTHENTICATION = {
    NOAUTH: 0x00,
    GSSAPI: 0x01,
    USERPASS: 0x02,
    NONE: 0xff
};
exports.REQUEST_CMD = {
    CONNECT: 0x01,
    BIND: 0x02,
    UDP_ASSOCIATE: 0x03
};
exports.ATYP = {
    IP_V4: 0x01,
    DOMAINNAME: 0x03,
    IP_V6: 0x04
};
exports.REPLIES_REP = {
    SUCCEEDED: 0x00,
    GENERAL_FAILURE: 0x01,
    CONNECTION_NOT_ALLOWED: 0x02,
    NETWORK_UNREACHABLE: 0x03,
    HOST_UNREACHABLE: 0x04,
    CONNECTION_REFUSED: 0x05,
    TTL_EXPIRED: 0x06,
    COMMAND_NOT_SUPPORTED: 0x07,
    ADDRESS_TYPE_NOT_SUPPORTED: 0x08
};
