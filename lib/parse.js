"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
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
