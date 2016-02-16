'use strict'
const crypto = require('crypto')
const METHOD = 'aes-256-cfb'

let getCipher = (password) => {
    return crypto.createCipher(METHOD, password)
}

let getDecipher = (password) => {
    return crypto.createDecipher(METHOD, password)
}

module.exports = {

    getCipher: getCipher,

    getDecipher: getDecipher,

    /**
     * 对buffer加解密
     */
    encrypt: (buffer, password) => {
        let cipher = getCipher(password)
        return Buffer.concat([cipher.update(buffer), cipher.final()])
    },

    decrypt: (buffer, password) => {
        let decipher = getDecipher(password)
        return Buffer.concat([decipher.update(buffer) , decipher.final()])
    }
}