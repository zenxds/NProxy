import * as socks4 from './socks4'
import * as socks5 from './socks5'

type Result = [string, number]

export default function parse(buffer: Buffer): Result {
  let ret: Result = ['', 0]

  if (buffer[0] === socks4.SOCKS_VERSION) {
    ret = socks4.parse(buffer)
  }

  if (buffer[0] === socks5.SOCKS_VERSION) {
    ret = socks5.parse(buffer)
  }

  return ret
}
