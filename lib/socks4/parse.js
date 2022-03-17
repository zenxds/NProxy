"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __importDefault(require("util"));
const constant_1 = require("./constant");
function parse(buffer) {
    const port = buffer.readUInt16BE(2);
    let host = util_1.default.format('%s.%s.%s.%s', buffer[4], buffer[5], buffer[6], buffer[7]);
    if (/^0\.0\.0\./.test(host) && buffer[7] !== 0) {
        const arr = [];
        buffer.slice(8).forEach((item, index) => {
            if (item === constant_1.SOCKS_NULL) {
                arr.push(index + 8);
            }
        });
        if (arr.length === 2) {
            host = buffer.toString('utf8', arr[0] + 1, arr[1]);
        }
    }
    return [host, port];
}
exports.default = parse;
