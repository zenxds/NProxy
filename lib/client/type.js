"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("events"));
class SocksClass extends events_1.default {
    emitConnect(data) {
        this.emit('connect', data);
    }
}
exports.SocksClass = SocksClass;
