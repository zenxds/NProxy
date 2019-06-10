import { Transform } from 'stream'

import { TransformCallback } from '../type'

class EncryptStream extends Transform {
  password: string
  index: number

  constructor(password: string, iv: string) {
    super()

    this.password = password
    this.index = iv.length
  }

  encrypt(data: Buffer): Buffer {
    const buffer = Buffer.alloc(data.length)
    data.copy(buffer)

    const { password } = this

    for (let i = 0; i < data.length; i++) {
      this.index += 1
      buffer[i] = buffer[i] ^ password.charCodeAt(this.index % password.length)
    }

    return buffer
  }

  _transform(
    chunk: Buffer,
    encoding: string,
    callback: TransformCallback
  ): void {
    this.push(this.encrypt(chunk))
    callback()
  }
}

export function getCipher(password: string, iv: string): EncryptStream {
  return new EncryptStream(password, iv)
}

export function getDecipher(password: string, iv: string): EncryptStream {
  return new EncryptStream(password, iv)
}

export function encrypt(buffer: Buffer, password: string, iv: string): Buffer {
  const cipher = getCipher(password, iv)
  return cipher.encrypt(buffer)
}

export function decrypt(buffer: Buffer, password: string, iv: string): Buffer {
  const decipher = getDecipher(password, iv)
  return decipher.encrypt(buffer)
}
