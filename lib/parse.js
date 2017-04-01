'use strict'
/**
 * parse host and port
 */
const util = require('util')
const socks = require('./socks5')
const ATYP = socks.ATYP

const parsers = {
  // IPV4
  [ATYP.IP_V4]: (buffer, offset) => {
    const host = util.format('%s.%s.%s.%s', buffer[offset + 1], buffer[offset+ 2], buffer[offset + 3], buffer[offset + 4])
    const port = buffer.readUInt16BE(offset + 4 + 1)
    return [host, port]
  },

  // DOMAIN NAME
  [ATYP.DOMAINNAME]: (buffer, offset) => {
    // offset + 1是domain的长度
    const host = buffer.toString('utf8', offset + 2, offset + 2 + buffer[offset + 1])
    const port = buffer.readUInt16BE(offset + 1 + buffer[offset + 1] + 1)
    return [host, port]
  },

  // IPV6
  [ATYP.IP_V6]: (buffer, offset) => {
    const host = buffer.slice(buffer[offset + 1], buffer[offset + 1 + 16])
    const port = buffer.readUInt16BE(offset + 1 + 16)
    return [host, port]
  }
}

module.exports = (buffer, offset) => {
  offset = offset || 3
  return parsers[buffer[offset]](buffer, offset)
}
