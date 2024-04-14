import createDebug from 'debug'
import { SOCKS_VERSION as SOCKS5_VERSION, ATYP } from '../socks5'

export function isIP(host: string): boolean {
  return /\d+\.\d+\.\d+\.\d+/.test(host)
}

export function transformConnect(data: Buffer, host: string): Buffer {
  if (isIP(host)) {
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
      data[3],
    ])
  }

  return Buffer.from(
    [
      SOCKS5_VERSION,
      // 命令位，忽略
      0,
      // 保留位
      0,
      ATYP.DOMAINNAME,
      host.length,
    ]
      .concat(Array.from(Buffer.from(host)))
      .concat([
        // port
        data[2],
        data[3],
      ]),
  )
}

export const debug = createDebug('NProxy')
