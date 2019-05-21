import * as net from 'net'

import parse from '../parse'
import { getDecipher, getCipher, decrypt } from '../encrypt'
import { ServerOptions } from '../type'

enum Status {
  initial = 0,
  handleData = 1
}

type Options = ServerOptions & {
  socket: net.Socket
}

export default class Socket {
  options: Options
  socket: net.Socket
  remote: net.Socket
  status: Status
  host: string
  port: number

  constructor(options: Options) {
    this.options = options
    this.socket = options.socket
    this.status = Status.initial
    this.bind()
  }

  bind(): void {
    const socket = this.socket

    socket.on(
      'data',
      (data): void => {
        // 解密第一个包，得到host和port
        if (this.status === Status.initial) {
          this.parse(data)
          this.handleData()
        }
      }
    )

    socket.on('error', err => {})

    socket.on(
      'end',
      (): void => {
        if (this.remote) {
          this.remote.end()
        }
      }
    )

    // socket.on('drain', () => {
    //   if (this.remote) {
    //     this.remote.resume()
    //   }
    // })

    socket.on(
      'close',
      (err): void => {
        if (!this.remote) {
          return
        }

        if (err) {
          this.remote.destroy()
        } else {
          this.remote.end()
        }
      }
    )

    socket.setTimeout(60 * 1000)
    socket.on(
      'timeout',
      (): void => {
        socket.end()
      }
    )
  }

  parse(data: Buffer): void {
    const { options } = this

    data = decrypt(data, options.password, options.iv)

    const [host, port] = parse(data)

    this.host = host
    this.port = port
    this.status = Status.handleData
  }

  handleData(): void {
    const { host, port, socket, options } = this

    const remote = (this.remote = net.connect(port, host))
    remote.setNoDelay(true)

    /**
     * 解密，发送原文到真正的服务器
     */
    const decipher = getDecipher(options.password, options.iv)
    socket.pipe(decipher).pipe(remote)

    /**
     * 将结果加密返回
     */
    const cipher = getCipher(options.password, options.iv)
    remote.pipe(cipher).pipe(socket)

    remote.on(
      'end',
      (): void => {
        socket.end()
      }
    )

    remote.on(
      'close',
      (err): void => {
        if (err) {
          socket.destroy()
        } else {
          socket.end()
        }
      }
    )

    remote.setTimeout(60 * 1000)
    remote.on(
      'timeout',
      (): void => {
        remote.end()
      }
    )
  }
}
