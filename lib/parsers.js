'use strict'
/**
 * parse host and port
 */
const socks = require('./socks5')
const ATYP = socks.ATYP

module.exports = {
    // IPV4
    [ATYP.IP_V4]: (buffer, offset) => {
        let host = util.format('%s.%s.%s.%s', buffer[offset + 1], buffer[offset+ 2], buffer[offset + 3], buffer[offset + 4])
        let port = buffer.readUInt16BE(offset + 4 + 1)
        return [host, port]
    },

    // DOMAIN NAME
    [ATYP.DOMAINNAME]: (buffer, offset) => {
        // offset + 1是domain的长度
        let host = buffer.toString('utf8', offset + 2, offset + 2 + buffer[offset + 1])
        let port = buffer.readUInt16BE(offset + 1 + buffer[offset + 1] + 1)
        return [host, port]
    },

    // IPV6
    [ATYP.IP_V6]: (buffer, offset) => {
        let host = buffer.slice(buffer[offset + 1], buffer[offset + 1 + 16])
        let port = buffer.readUInt16BE(offset + 1 + 16)
        return [host, port]
    }
}