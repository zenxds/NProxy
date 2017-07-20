'use strict'

const encryptors = {
  'aes-256-gcm': require('./encryptor/gcm'),
  'aes-256-cfb': require('./encryptor/cfb')
}
// const METHOD = 'aes-256-gcm'

module.exports = {
  getCipher: encryptors['aes-256-cfb'].getCipher,
  getDecipher: encryptors['aes-256-cfb'].getDecipher,

  encrypt: encryptors['aes-256-gcm'].encrypt,
  decrypt: encryptors['aes-256-gcm'].decrypt
}