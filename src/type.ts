import stream from 'stream'

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
  getCipher: (password: string, iv: string) => stream.Duplex
  getDecipher: (password: string, iv: string) => stream.Duplex
  encrypt: (buffer: Buffer, password: string, iv: string) => Buffer
  decrypt: (buffer: Buffer, password: string, iv: string) => Buffer
}

export interface TransformCallback {
  (error?: Error | null, data?: any): void
}
