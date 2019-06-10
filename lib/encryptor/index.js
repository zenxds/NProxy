"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cfb = require("./cfb");
const encryptor1 = require("./encryptor1");
const encryptors = {
    '1': cfb,
    '2': encryptor1
};
exports.default = encryptors;
