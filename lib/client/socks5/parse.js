"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __importDefault(require("util"));
const constant_1 = require("./constant");
const parsers = {
    [constant_1.ATYP.IP_V4]: (buffer, offset) => {
        const host = util_1.default.format('%s.%s.%s.%s', buffer[offset + 1], buffer[offset + 2], buffer[offset + 3], buffer[offset + 4]);
        const port = buffer.readUInt16BE(offset + 4 + 1);
        return [host, port];
    },
    [constant_1.ATYP.DOMAINNAME]: (buffer, offset) => {
        const host = buffer.toString('utf8', offset + 2, offset + 2 + buffer[offset + 1]);
        const port = buffer.readUInt16BE(offset + 2 + buffer[offset + 1]);
        return [host, port];
    },
    [constant_1.ATYP.IP_V6]: (buffer, offset) => {
        const host = buffer.toString('utf8', buffer[offset + 1], buffer[offset + 1 + 16]);
        const port = buffer.readUInt16BE(offset + 1 + 16);
        return [host, port];
    }
};
function parse(buffer, offset) {
    offset = offset || 3;
    return parsers[buffer[offset]](buffer, offset);
}
exports.default = parse;
