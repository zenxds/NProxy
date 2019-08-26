import crypto from 'crypto'

const METHOD = 'aes-256-cfb'

export function getCipher(password: string, iv: string): crypto.Cipher {
  return crypto.createCipheriv(METHOD, password, iv)
}

export function getDecipher(password: string, iv: string): crypto.Decipher {
  return crypto.createDecipheriv(METHOD, password, iv)
}

export function encrypt(buffer: Buffer, password: string, iv: string): Buffer {
  const cipher = getCipher(password, iv)
  return Buffer.concat([cipher.update(buffer), cipher.final()])
}

export function decrypt(buffer: Buffer, password: string, iv: string): Buffer {
  const decipher = getDecipher(password, iv)
  return Buffer.concat([decipher.update(buffer), decipher.final()])
}
