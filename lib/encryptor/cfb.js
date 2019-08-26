"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const METHOD = 'aes-256-cfb';
function getCipher(password, iv) {
    return crypto_1.default.createCipheriv(METHOD, password, iv);
}
exports.getCipher = getCipher;
function getDecipher(password, iv) {
    return crypto_1.default.createDecipheriv(METHOD, password, iv);
}
exports.getDecipher = getDecipher;
function encrypt(buffer, password, iv) {
    const cipher = getCipher(password, iv);
    return Buffer.concat([cipher.update(buffer), cipher.final()]);
}
exports.encrypt = encrypt;
function decrypt(buffer, password, iv) {
    const decipher = getDecipher(password, iv);
    return Buffer.concat([decipher.update(buffer), decipher.final()]);
}
exports.decrypt = decrypt;
