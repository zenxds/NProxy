"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const cfb = __importStar(require("./cfb"));
const encryptor1 = __importStar(require("./encryptor1"));
const encryptors = {
    '1': cfb,
    '2': encryptor1
};
exports.default = encryptors;
