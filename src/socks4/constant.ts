// https://zh.wikipedia.org/wiki/SOCKS
export const SOCKS_VERSION = 0x04

export const SOCKS_NULL = 0x00

/*
 * o  CMD
 *    o  CONNECT X'01'
 *    o  BIND X'02'
 */
export const REQUEST_CMD = {
  CONNECT: 0x01,
  BIND: 0x02
}

export const REPLIES_REP = {
  GRANTED: 0x5a,
  REJECTED: 0x5b,
  FAILED_1: 0x5c,
  FAILED_2: 0x5d
}
