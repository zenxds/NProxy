import net from 'net'

import parse from '../parse'
import encryptors from '../encryptor'
import {
  SOCKS_VERSION,
  AUTHENTICATION,
  REQUEST_CMD,
  REPLIES_REP
} from '../socks5'
import { ClientOptions } from '../type'

const METHOD = 2
enum Status {
  initial = 0,
  handshake = 1,
  handleDetail = 2
}

type Options = ClientOptions & {
  socket: net.Socket
}

export default class Socket {
  options: Options
  socket: net.Socket
  remote: net.Socket
  status: Status

  constructor(options: Options) {
    this.options = options
    this.socket = options.socket
    this.status = Status.initial
    this.bind()
  }

  bind(): void {
    const socket = this.socket

    socket.on('data', (data): void => {
      // 第一次请求是协商版本和认证方法的请求
      // 第二次请求是请求细节
      // 后续请求是处理数据，改由pipe实现

      if (this.status === Status.initial) {
        this.handshake(data)
      } else if (this.status === Status.handshake) {
        this.handleDetail(data)
      }
    })

    socket.on('error', (err): void => {})

    socket.on('end', (): void => {
      if (this.remote) {
        this.remote.end()
      }
    })

    // socket.on('drain', () => {
    //   if (this.remote) {
    //     this.remote.resume()
    //   }
    // })

    socket.on('close', (err): void => {
      if (!this.remote) {
        return
      }

      if (err) {
        this.remote.destroy()
      } else {
        this.remote.end()
      }
    })

    socket.setTimeout(60 * 1000)
    socket.on('timeout', (): void => {
      socket.end()
    })
  }

  handshake(data: Buffer): void {
    const socket = this.socket

    if (!this.isSupport(data[0])) {
      socket.end()
      return
    }

    const nmethods = data[1]
    const authentications = new Set()
    for (let i = 0; i < nmethods; i++) {
      authentications.add(data[2 + i])
    }

    const reply = Buffer.alloc(2)
    reply[0] = SOCKS_VERSION

    /**
     * 只支持了不需要用户密码的情况
     */
    if (authentications.has(AUTHENTICATION.NOAUTH)) {
      reply[1] = AUTHENTICATION.NOAUTH
      socket.write(reply)

      // 握手完成
      this.status = Status.handshake
    } else {
      reply[1] = AUTHENTICATION.NONE
      socket.end(reply)
    }
  }

  handleDetail(data: Buffer): void {
    const socket = this.socket

    if (!this.isSupport(data[0])) {
      socket.end()
      return
    }

    const cmd = data[1]

    if (cmd === REQUEST_CMD.CONNECT) {
      this.createRemote(data)
    } else {
      // console.log(`unsupported cmd: ${cmd}`)
      socket.end()
    }
  }

  createRemote(data: Buffer): void {
    const { socket, options } = this
    const encryptor = encryptors[METHOD]
    const remote = (this.remote = net.connect(
      options.serverPort || 8886,
      options.serverHost
    ))

    remote.on('connect', (): void => {
      const reply = Buffer.alloc(data.length)
      data.copy(reply)
      reply[1] = REPLIES_REP.SUCCEEDED

      socket.write(reply)
      this.status = Status.handleDetail

      remote.setNoDelay(true)

      /**
       * 对返回数据解密
       */
      const decipher = encryptor.getDecipher(options.password, options.iv)
      remote.pipe(decipher).pipe(socket)
      // 主要目的是将 host 跟 port 加密发送
      remote.write(
        Buffer.concat([
          Buffer.from(this.options.header, 'utf8'),
          Buffer.from([METHOD]),
          encryptor.encrypt(reply, options.password, options.iv)
        ])
      )

      /**
       * 加密发送数据
       */
      const cipher = encryptor.getCipher(options.password, options.iv)
      socket.pipe(cipher).pipe(remote)
    })

    remote.on('error', (err): void => {})

    remote.on('end', (): void => {
      socket.end()
    })

    remote.on('close', (err): void => {
      if (err) {
        socket.destroy()
      } else {
        socket.end()
      }
    })

    remote.setTimeout(60 * 1000)
    remote.on('timeout', (): void => {
      remote.end()
    })
  }

  isSupport(version: number): boolean {
    return version === SOCKS_VERSION
  }
}
