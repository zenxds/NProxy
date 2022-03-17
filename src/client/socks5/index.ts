import net from 'net'
import dns from 'dns'
import { promisify } from 'util'

import {
  SOCKS_VERSION,
  AUTHENTICATION,
  REQUEST_CMD,
  REPLIES_REP,
  ATYP,
  parse
} from '../../socks5'
import { SocksClass } from '../type'

const lookup = promisify(dns.lookup)

enum Status {
  initial = 0,
  handshake = 1,
  handleDetail = 2
}

export default class Socks extends SocksClass {
  version: number
  status: Status
  socket: net.Socket

  constructor(socket: net.Socket) {
    super()

    this.version = SOCKS_VERSION
    this.status = Status.initial
    this.socket = socket
  }

  public handleData(data: Buffer): void {
    // 第一次请求是协商版本和认证方法的请求
    // 第二次请求是请求细节
    // 后续请求是处理数据，由pipe实现

    if (this.status === Status.initial) {
      this.handshake(data)
    } else if (this.status === Status.handshake) {
      this.handleDetail(data)
    }
  }

  private handshake(data: Buffer): void {
    const socket = this.socket

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

  public async replyConnect(data: Buffer): Promise<void> {
    const socket = this.socket
    const [host, port] = parse(data)

    let ip = ''

    // domain
    if (data[3] === ATYP.DOMAINNAME) {
      try {
        const lookupAddress = await lookup(host, { family: 4 })
        ip = lookupAddress.address
      } catch (err) {}
    } else if (data[3] === ATYP.IP_V4) {
      ip = host
    }

    const reply = Buffer.alloc(ip ? 10 : data.length)
    data.copy(reply)
    reply[1] = REPLIES_REP.SUCCEEDED

    if (ip) {
      reply[3] = ATYP.IP_V4

      const arr = ip.split('.')
      reply[4] = parseInt(arr[0])
      reply[5] = parseInt(arr[1])
      reply[6] = parseInt(arr[2])
      reply[7] = parseInt(arr[3])
      reply[8] = port >> 8
      reply[9] = port & 0xff
    }

    socket.write(reply)
    this.status = Status.handleDetail
  }

  private handleDetail(data: Buffer): void {
    const cmd = data[1]

    if (cmd === REQUEST_CMD.CONNECT) {
      this.emitConnect(data)
    } else {
      // console.log(`unsupported cmd: ${cmd}`)
      this.socket.end()
    }
  }
}
