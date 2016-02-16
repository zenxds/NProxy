'use strict'

// https://www.ietf.org/rfc/rfc1928.txt
const SOCKS_VERSION = 5

// 客户端连接到服务器，然后发送一个协商版本和认证方法的请求
// 本版本为5
// +----+----------+----------+
// |VER | NMETHODS | METHODS  |
// +----+----------+----------+
// | 5  |    1     | 1 to 255 |
// +----+----------+----------+

// 服务器从这些给定的方法中选择一个并发送一个方法选中的消息回客户端：
// +----+--------+
// |VER | METHOD |
// +----+--------+
// | 5  |   1    |
// +----+--------+

// 一旦协商过程结束后，双方进入相应的子协议
// 客户端开始发送详细的请求信息
// +----+-----+-------+------+----------+----------+
// |VER | CMD |  RSV  | ATYP | DST.ADDR | DST.PORT |
// +----+-----+-------+------+----------+----------+
// | 1  |  1  | X'00' |  1   | Variable |    2     |
// +----+-----+-------+------+----------+----------+

// 服务器reply一到多条数据
// +----+-----+-------+------+----------+----------+
// |VER | REP |  RSV  | ATYP | BND.ADDR | BND.PORT |
// +----+-----+-------+------+----------+----------+
// | 1  |  1  | X'00' |  1   | Variable |    2     |
// +----+-----+-------+------+----------+----------+

/*
 * Authentication methods 认证方法
 ************************
 * o  X'00' NO AUTHENTICATION REQUIRED
 * o  X'01' GSSAPI
 * o  X'02' USERNAME/PASSWORD
 * o  X'03' to X'7F' IANA ASSIGNED
 * o  X'80' to X'FE' RESERVED FOR PRIVATE METHODS
 * o  X'FF' NO ACCEPTABLE METHODS
 */
const AUTHENTICATION = {
    NOAUTH: 0x00,
    // GSSAPI: 0x01,
    // USERPASS: 0x02,
    NONE: 0xFF
}

/*
 * o  CMD
 *    o  CONNECT X'01'
 *    o  BIND X'02'
 *    o  UDP ASSOCIATE X'03'
 */
const REQUEST_CMD = {
    CONNECT: 0x01,
    BIND: 0x02,
    UDP_ASSOCIATE: 0x03
}


/*
 * o  ATYP   address type of following address
 *    o  IP V4 address: X'01'
 *    o  DOMAINNAME: X'03'
 *    o  IP V6 address: X'04'
 */
const ATYP = {
    IP_V4: 0x01,
    DOMAINNAME: 0x03,
    IP_V6: 0x04
}

const REPLIES_REP = {
    SUCCEEDED : 0x00,
    GENERAL_FAILURE : 0x01,
    CONNECTION_NOT_ALLOWED : 0x02,
    NETWORK_UNREACHABLE : 0x03,
    HOST_UNREACHABLE : 0x04,
    CONNECTION_REFUSED : 0x05,
    TTL_EXPIRED : 0x06,
    COMMAND_NOT_SUPPORTED : 0x07,
    ADDRESS_TYPE_NOT_SUPPORTED : 0x08
}

module.exports = {
    SOCKS_VERSION: SOCKS_VERSION,
    AUTHENTICATION: AUTHENTICATION,
    REQUEST_CMD: REQUEST_CMD,
    ATYP: ATYP,
    REPLIES_REP: REPLIES_REP
}
