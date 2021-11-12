import stream from 'stream'
import EventEmitter from 'events'

export interface ClientOptions {
  serverHost: string
  serverPort?: number
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

export abstract class SocksClass extends EventEmitter {
  abstract handleData(data: Buffer): void
  abstract replyConnect(data: Buffer): void

  protected emitConnect(data: Buffer): void {
    this.emit('connect', data)
  }
}
