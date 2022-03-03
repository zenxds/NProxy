"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = exports.getDecipher = exports.getCipher = void 0;
const stream_1 = require("stream");
class EncryptStream extends stream_1.Transform {
    constructor(password, iv) {
        super();
        this.password = password;
        this.index = iv.length;
    }
    encrypt(data) {
        const buffer = Buffer.alloc(data.length);
        data.copy(buffer);
        const { password } = this;
        for (let i = 0; i < data.length; i++) {
            this.index += 1;
            buffer[i] = buffer[i] ^ password.charCodeAt(this.index % password.length);
        }
        return buffer;
    }
    _transform(chunk, encoding, callback) {
        this.push(this.encrypt(chunk));
        callback();
    }
}
function getCipher(password, iv) {
    return new EncryptStream(password, iv);
}
exports.getCipher = getCipher;
function getDecipher(password, iv) {
    return new EncryptStream(password, iv);
}
exports.getDecipher = getDecipher;
function encrypt(buffer, password, iv) {
    const cipher = getCipher(password, iv);
    return cipher.encrypt(buffer);
}
exports.encrypt = encrypt;
function decrypt(buffer, password, iv) {
    const decipher = getDecipher(password, iv);
    return decipher.encrypt(buffer);
}
exports.decrypt = decrypt;
