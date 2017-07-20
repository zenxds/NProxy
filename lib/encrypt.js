'use strict'

const encryptors = {
  'aes-256-gcm': require('./encryptor/gcm'),
  'aes-256-cfb': require('./encryptor/cfb')
}
const METHOD = 'aes-256-gcm'

module.exports = encryptors[METHOD]