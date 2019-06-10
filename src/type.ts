import * as crypto from 'crypto'

export interface ClientOptions {
  serverHost: string
  serverPort?: number
  password: string
  iv: string
  header: string
}

export interface ServerOptions {
  port?: number
  password: string
  iv: string
  header: string
}

export interface Encryptor {
  getCipher: (password: string, iv: string) => crypto.Cipher
  getDecipher: (password: string, iv: string) => crypto.Decipher
  encrypt: (buffer: Buffer, password: string, iv: string) => Buffer
  decrypt: (buffer: Buffer, password: string, iv: string) => Buffer
}
