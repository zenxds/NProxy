/**
 * https://zh.wikipedia.org/wiki/SOCKS
 */
import util from 'util'
import { SOCKS_NULL } from './constant'

type Result = [string, number]

export default function parse(buffer: Buffer): Result {
  const port = buffer.readUInt16BE(2)
  let host = util.format(
    '%s.%s.%s.%s',
    buffer[4],
    buffer[5],
    buffer[6],
    buffer[7]
  )

  // SOCKS4a
  if (/^0\.0\.0\./.test(host) && buffer[7] !== 0) {
    const arr: number[] = []
    buffer.slice(8).forEach((item, index) => {
      if (item === SOCKS_NULL) {
        arr.push(index + 8)
      }
    })

    if (arr.length === 2) {
      host = buffer.toString('utf8', arr[0] + 1, arr[1])
    }
  }

  return [host, port]
}
