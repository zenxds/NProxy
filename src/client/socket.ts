import net from 'net'
import encryptors from '../encryptor'
import { SOCKS_VERSION as SOCKS4_VERSION } from '../socks4'
import { SOCKS_VERSION as SOCKS5_VERSION } from '../socks5'
import Socks4 from './socks4'
import Socks5 from './socks5'
import parse from '../parse'
import { transformConnect, debug } from './util'
import { ClientOptions, SocksClass } from './type'

const METHOD = 2

type Options = ClientOptions & {
  socket: net.Socket
}

export default class Socket {
  options: Options
  socket: net.Socket
  remote: net.Socket
  socksMap: {
    [key: string]: SocksClass
  }

  constructor(options: Options) {
    this.options = options
    this.socket = options.socket
    this.socksMap = {
      [SOCKS4_VERSION]: new Socks4(this.socket),
      [SOCKS5_VERSION]: new Socks5(this.socket),
    }

    this.bind()
  }

  bind(): void {
    const { socket, socksMap } = this

    for (const i in socksMap) {
      const socks = socksMap[i]
      socks.once('connect', (data: Buffer): void => {
        this.connectRemote(data, socks)
      })
    }

    socket.setNoDelay(true)

    socket.on('data', (data): void => {
      // 有remote代表进入了转发阶段，通过pipe实现
      if (this.remote) {
        return
      }

      const version = data[0]

      if (socksMap[version]) {
        socksMap[version].handleData(data)
      } else {
        this.end(socket, true)
      }
    })

    socket.on('error', (err): void => {
      debug('client err: %s', err.message)
    })

    socket.on('end', (): void => {
      this.unbind()
      this.end(this.remote)
    })

    socket.on('close', (err): void => {
      this.unbind()
      this.end(this.remote, err)
    })

    socket.setTimeout(60 * 1000)
    socket.on('timeout', (): void => {
      this.end(socket, true)
    })
  }

  unbind(): void {
    const { socksMap } = this

    for (const i in socksMap) {
      socksMap[i].removeAllListeners()
    }
  }

  end(socket?: net.Socket, err?: boolean): void {
    if (!socket || socket.destroyed) {
      return
    }

    if (err) {
      socket.destroy()
    } else {
      socket.end()
    }
  }

  connectRemote(data: Buffer, socks: SocksClass): void {
    const { socket, options } = this

    const [host, port] = parse(data)
    const isLocal = /(localhost|127\.0\.0\.1)/.test(host)

    socket.pause()

    const remote = (this.remote = isLocal
      ? net.connect(port, host)
      : net.connect(options.serverPort || 8886, options.serverHost))
    const version = data[0]

    remote.setNoDelay(true)
    remote.on('connect', (): void => {
      socket.resume()
      socks.replyConnect(data)

      if (isLocal) {
        socket.pipe(remote)
        remote.pipe(socket)
        return
      }

      const header = Buffer.from(options.header, 'utf8')
      const encryptor = encryptors[METHOD]

      // 主要目的是将 host 跟 port 加密发送
      if (version === SOCKS5_VERSION) {
        const buffer = Buffer.alloc(data.length)
        data.copy(buffer)
        remote.write(
          Buffer.concat([
            header,
            Buffer.from([METHOD]),
            encryptor.encrypt(buffer, options.password, options.iv),
          ]),
        )
      }

      // 服务端基于版本5解析，这里构造5的请求格式
      if (version === SOCKS4_VERSION) {
        const buffer = transformConnect(data, host)
        remote.write(
          Buffer.concat([
            header,
            Buffer.from([METHOD]),
            encryptor.encrypt(buffer, options.password, options.iv),
          ]),
        )
      }

      /**
       * 对返回数据解密
       */
      const decipher = encryptor.getDecipher(options.password, options.iv)
      remote.pipe(decipher).pipe(socket)

      /**
       * 加密发送数据
       */
      const cipher = encryptor.getCipher(options.password, options.iv)
      socket.pipe(cipher).pipe(remote)
    })

    remote.on('error', (err): void => {
      debug('remote err: %s', err.message)
    })

    remote.on('end', (): void => {
      this.end(socket)
    })

    remote.on('close', (err): void => {
      this.end(socket, err)
    })

    remote.setTimeout(60 * 1000)
    remote.on('timeout', (): void => {
      this.end(remote, true)
    })
  }
}
