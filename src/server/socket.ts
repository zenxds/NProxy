import net from 'net'
import createDebug from 'debug'

import parse from '../parse'
import encryptors from '../encryptor'
import { ServerOptions, Encryptor } from '../type'

const debug = createDebug('NProxy:server')

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
  encryptor: Encryptor

  constructor(options: Options) {
    this.options = options
    this.socket = options.socket
    this.status = Status.initial
    this.bind()
  }

  bind(): void {
    const socket = this.socket

    socket.on('data', (data): void => {
      // 解密第一个包，得到host和port
      if (this.status === Status.initial) {
        this.parse(data)
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
      socket.destroy()
    })
  }

  parse(data: Buffer): void {
    const { options, socket } = this
    const header = options.header || ''

    if (header && data.toString('utf8', 0, header.length) !== header) {
      debug('header not match')
      return socket.end()
    }

    const method = data[header.length]
    const encryptor = (this.encryptor = encryptors[method])

    if (!encryptor) {
      debug('no encryptor')
      return socket.end()
    }

    data = encryptor.decrypt(
      data.slice(header.length + 1),
      options.password,
      options.iv
    )

    const [host, port] = parse(data)

    // 偶尔会有一些非法的connect，数据格式不正常
    if (!host) {
      debug('no host')
      return socket.end()
    }

    this.host = host
    this.port = port
    this.status = Status.handleData
    this.handleData()
  }

  handleData(): void {
    const { host, port, socket, options, encryptor } = this

    socket.pause()

    debug(`connect to remote ${host}:${port}`)
    const remote = (this.remote = net.connect(port, host))

    remote.setNoDelay(true)
    remote.on('connect', () => {
      debug(`${host}:${port} socket resume`)
      socket.resume()
    })

    /**
     * 解密，发送原文到真正的服务器
     */
    const decipher = encryptor.getDecipher(options.password, options.iv)
    socket.pipe(decipher).pipe(remote)

    /**
     * 将结果加密返回
     */
    const cipher = encryptor.getCipher(options.password, options.iv)
    remote.pipe(cipher).pipe(socket)

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
      remote.destroy()
    })
  }
}
