import net from 'net'

import {
  SOCKS_VERSION,
  SOCKS_NULL,
  REQUEST_CMD,
  REPLIES_REP,
} from '../../socks4'
import { SocksClass } from '../type'

export default class Socks extends SocksClass {
  version: number
  socket: net.Socket

  constructor(socket: net.Socket) {
    super()

    this.version = SOCKS_VERSION
    this.socket = socket
  }

  public handleData(data: Buffer): void {
    const cmd = data[1]

    if (cmd === REQUEST_CMD.CONNECT) {
      this.emitConnect(data)
    } else {
      // console.log(`unsupported cmd: ${cmd}`)
    }
  }

  public replyConnect(data: Buffer): void {
    const socket = this.socket

    const reply = Buffer.alloc(8)
    data.copy(reply)
    reply[0] = SOCKS_NULL
    reply[1] = REPLIES_REP.GRANTED

    socket.write(reply)
  }
}
