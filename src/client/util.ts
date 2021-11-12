import createDebug from 'debug'
import { SOCKS_NULL } from './socks4/constant'
import { SOCKS_VERSION as SOCKS5_VERSION, ATYP } from './socks5/constant'

export function transformConnect(data: Buffer): Buffer {
  const ip = [data[4], data[5], data[6], data[7]].join('.')

  // SOCKS4a
  if (
    /^0\.0\.0\./.test(ip) &&
    data[7] !== 0 &&
    data[data.length - 1] === SOCKS_NULL
  ) {
    const domain = []

    for (let i = data.length - 2; i >= 8; i--) {
      if (data[i] === SOCKS_NULL) {
        break
      }

      domain.unshift(data[i])
    }

    if (domain.length) {
      return Buffer.from(
        [
          SOCKS5_VERSION,
          // 命令位，忽略
          0,
          // 保留位
          0,
          ATYP.DOMAINNAME,
          domain.length
        ]
          .concat(domain)
          .concat([
            // port
            data[2],
            data[3]
          ])
      )
    }
  }

  return Buffer.from([
    SOCKS5_VERSION,
    // 命令位，忽略
    0,
    // 保留位
    0,
    ATYP.IP_V4,
    // IP
    data[4],
    data[5],
    data[6],
    data[7],
    // port
    data[2],
    data[3]
  ])
}

export const debug = createDebug('NProxy')
