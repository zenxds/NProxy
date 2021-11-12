import net from 'net'

import { SOCKS_VERSION, AUTHENTICATION, REQUEST_CMD, REPLIES_REP } from './constant'
import { SocksClass } from '../type'

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

  public replyConnect(data: Buffer): void {
    const socket = this.socket

    const reply = Buffer.alloc(data.length)
    data.copy(reply)
    reply[1] = REPLIES_REP.SUCCEEDED
    socket.write(reply)

    this.status = Status.handleDetail
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
