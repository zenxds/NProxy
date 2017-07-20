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
    let data = cipher.update(buffer)
    data += cipher.final()

    const authTag = cipher.getAuthTag()
    return authTag + data
  },

  decrypt: (buffer, password, iv) => {
    const decipher = getDecipher(password, iv)
    const authTag = buffer.slice(0, 16)
    decipher.setAuthTag(authTag)
    
    let data = decipher.update(buffer.slice(16))
    data += decipher.final()    
    return data
  }
}
