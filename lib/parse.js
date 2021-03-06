"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __importDefault(require("util"));
const socks = __importStar(require("./socks5"));
const ATYP = socks.ATYP;
const parsers = {
    [ATYP.IP_V4]: (buffer, offset) => {
        const host = util_1.default.format('%s.%s.%s.%s', buffer[offset + 1], buffer[offset + 2], buffer[offset + 3], buffer[offset + 4]);
        const port = buffer.readUInt16BE(offset + 4 + 1);
        return [host, port];
    },
    [ATYP.DOMAINNAME]: (buffer, offset) => {
        const host = buffer.toString('utf8', offset + 2, offset + 2 + buffer[offset + 1]);
        const port = buffer.readUInt16BE(offset + 2 + buffer[offset + 1]);
        return [host, port];
    },
    [ATYP.IP_V6]: (buffer, offset) => {
        const host = buffer.toString('utf8', buffer[offset + 1], buffer[offset + 1 + 16]);
        const port = buffer.readUInt16BE(offset + 1 + 16);
        return [host, port];
    }
};
function parse(buffer, offset) {
    offset = offset || 3;
    const method = parsers[buffer[offset]];
    if (!method) {
        return ['', 0];
    }
    return method(buffer, offset);
}
exports.default = parse;
