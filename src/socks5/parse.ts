/**
 * parse host and port
 */
import util from 'util'
import { ATYP } from './constant'

type Result = [string, number]

const parsers = {
  // IPV4
  [ATYP.IP_V4]: (buffer: Buffer, offset: number): Result => {
    const host = util.format(
      '%s.%s.%s.%s',
      buffer[offset + 1],
      buffer[offset + 2],
      buffer[offset + 3],
      buffer[offset + 4],
    )
    const port = buffer.readUInt16BE(offset + 4 + 1)

    return [host, port]
  },

  // DOMAIN NAME
  [ATYP.DOMAINNAME]: (buffer: Buffer, offset: number): Result => {
    // offset + 1是domain的长度
    // toString 不包含结束
    const host = buffer.toString(
      'utf8',
      offset + 2,
      offset + 2 + buffer[offset + 1],
    )
    const port = buffer.readUInt16BE(offset + 2 + buffer[offset + 1])

    return [host, port]
  },

  // IPV6
  [ATYP.IP_V6]: (buffer: Buffer, offset: number): Result => {
    const host = buffer.toString(
      'utf8',
      buffer[offset + 1],
      buffer[offset + 1 + 16],
    )
    const port = buffer.readUInt16BE(offset + 1 + 16)

    return [host, port]
  },
}

export default function parse(buffer: Buffer, offset?: number): Result {
  offset = offset || 3

  const method = parsers[buffer[offset]]
  if (!method) {
    return ['', 0]
  }

  return method(buffer, offset)
}
