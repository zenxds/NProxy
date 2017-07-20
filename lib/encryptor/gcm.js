'use strict'
const crypto = require('crypto')
const METHOD = 'aes-256-gcm'

const getCipher = (password, iv) => {
  return crypto.createCipheriv(METHOD, password, iv)
}

const getDecipher = (password, iv) => {
  return crypto.createDecipheriv(METHOD, password, iv)
}

module.exports = {

  getCipher: getCipher,

  getDecipher: getDecipher,

  /**
   * 对buffer加解密
   */
  encrypt: (buffer, password, iv) => {
    const cipher = getCipher(password, iv)
    const data = Buffer.concat([cipher.update(buffer), cipher.final()])
    return Buffer.concat([cipher.getAuthTag(), data])
  },

  decrypt: (buffer, password, iv) => {
    const decipher = getDecipher(password, iv)
    const authTag = buffer.slice(0, 16)
    const data = buffer.slice(16)
    
    decipher.setAuthTag(authTag)
    return Buffer.concat([decipher.update(data) , decipher.final()])
  }
}
