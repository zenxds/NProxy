'use strict'
const crypto = require('crypto')
const METHOD = 'aes-256-cfb'

const getCipher = (password, iv) => {
  return crypto.createCipher(METHOD, password)
}

const getDecipher = (password, iv) => {
  return crypto.createDecipher(METHOD, password)
}

module.exports = {

  getCipher: getCipher,

  getDecipher: getDecipher,

  /**
   * 对buffer加解密
   */
  encrypt: (buffer, password, iv) => {
    const cipher = getCipher(password, iv)
    return Buffer.concat([cipher.update(buffer), cipher.final()])
  },

  decrypt: (buffer, password, iv) => {
    const decipher = getDecipher(password, iv)
    return Buffer.concat([decipher.update(buffer) , decipher.final()])
  }
}
