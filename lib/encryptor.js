'use strict'
const crypto = require('crypto')

let getCipher = (password) => {
    return crypto.createCipher('aes-256-cfb', password)
}

let getDecipher = (password) => {
    return crypto.createDecipher('aes-256-cfb', password)
}

module.exports = {

    getCipher: getCipher,

    getDecipher: getDecipher,

    encrypt: (buffer, password) => {
        let cipher = getCipher(password)
        return Buffer.concat([cipher.update(buffer), cipher.final()])
    },

    decrypt: (buffer, password) => {
        let decipher = getDecipher(password)
        return Buffer.concat([decipher.update(buffer) , decipher.final()])
    }
}