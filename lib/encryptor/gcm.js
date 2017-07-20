'use strict'
const crypto = require('crypto')
const Transform = require('stream').Transform
const METHOD = 'aes-256-gcm'

const getCipher = (password, iv) => {
  return crypto.createCipheriv(METHOD, password, iv)
}

const getDecipher = (password, iv) => {
  return crypto.createDecipheriv(METHOD, password, iv)
}

class EncryptStream extends Transform {
  constructor(options) {
    super(options)
    
    this.cipher = options.cipher
  }

  _transform(chunk, encoding, callback) {
    this.push(this.cipher.update(chunk))
    callback()
  }

  _flush(callback) {
    this.push(this.cipher.final())
    this.push(this.cipher.getAuthTag())

    callback()
  }
}

class DecryptStream extends Transform {
  constructor(options) {
    super(options)
    
    this.decipher = options.decipher
    this._chunks = []
  }

  _transform(chunk, encoding, callback) {
    this._chunks.push(chunk)
    callback()
  }

  _flush(callback) {
    // 从末尾16位取出authTag
    const data = Buffer.concat(this._chunks)
    const authTag = data.slice(-16)
    this.decipher.setAuthTag(authTag)

    this.push(Buffer.concat(this.decipher.update(data.slice(0, -16)), this.decipher.final()))
    callback()
  }
}

module.exports = {

  getCipher: (password, iv) => {
    return new EncryptStream({
      cipher: getCipher(password, iv)
    })
  },

  getDecipher: (password, iv) => {
    return new DecryptStream({
      decipher: getDecipher(password, iv)
    })
  },

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
    decipher.setAuthTag(authTag)
    
    return Buffer.concat([decipher.update(buffer.slice(16)), decipher.final()])
  }
}
