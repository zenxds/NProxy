'use strict'

/**
 * NProxy client部分
 * socks5代理
 */
const net = require('net')

const parse = require('../parse')
const encrypt = require('../encrypt')
const socks = require('../socks5')
const AUTHENTICATION = socks.AUTHENTICATION
const SOCKS_VERSION = socks.SOCKS_VERSION
const REQUEST_CMD = socks.REQUEST_CMD
const REPLIES_REP = socks.REPLIES_REP

/**
 * socks5代理 client部分
 */
const run = (config) => {
  const debug = config.debug

  console.info(`${config.name} version: ${config.version}`)
  console.info(`debug: ${debug}`)

  net.createServer()
  .on('connection', (socket) => {
    onConnection(socket, config)
  })
  .listen(config.port, '0.0.0.0', () => {
    console.info(`${config.name} client is running at ${config.port}`)
  })
}

function onConnection(socket, config) {
  socket.config = config
  socket.remote = null
  socket.status = 0

  socket.on('data', function(data) {
    let next

    // 第一次请求是协商版本和认证方法的请求
    if (this.status === 0) {
      next = handshake
    }

    // 第二次请求是请求细节
    if (this.status === 1) {
      next = handleDetail
    }

    // 后续请求是处理数据，改由pipe实现
    // if (this.status === 2) {
    //     next = handleData
    // }

    next && next.bind(this)(data)
  })

  socket.on('error', function(err) {
    console.error(`client socket error: ${err.code}\n${err.message}\n`)
  })

  socket.on('end', function() {
    this.remote && this.remote.end()
  })

  socket.on('close', function(err) {
    if (err) {
      this.remote && this.remote.destroy()
    } else {
      this.remote && this.remote.end()
    }
  })
}

/**
 * 检查socket版本号
 */
function isSupportVersion(version) {
  if (version !== SOCKS_VERSION) {
    console.log(`socks version ${version} is unsupported`)
    return false
  }
  return true
}

/**
 * 握手阶段
 * 协商版本和认证方法
 */
function handshake(data) {
  if (!isSupportVersion(data[0])) {
    this.end()
    return
  }

  const nmethods = data[1]
  const authentications = new Set()
  for (let i = 0; i < nmethods; i++) {
    authentications.add(data[2 + i])
  }

  const reply = new Buffer(2)
  reply[0] = SOCKS_VERSION

  /**
   * 只支持了不需要用户密码的情况
   */
  if (authentications.has(AUTHENTICATION.NOAUTH)) {
    reply[1] = AUTHENTICATION.NOAUTH
    this.write(reply)

    // 握手完成
    this.status = 1
  } else {
    console.log('no suported authentication method')
    reply[1] = AUTHENTICATION.NONE
    this.end(reply)
  }
}

/**
 * 处理客户端发来的请求细节
 * 根据请求的内容返回一到多条消息
 */
function handleDetail(data) {
  if (!isSupportVersion(data[0])) {
    this.end()
    return
  }

  const config = this.config
  const cmd = data[1]
  const parsed = parse(data)
  const host = parsed[0]
  const port = parsed[1]

  console.log(`receive cmd ${cmd}: to ${host}:${port}`)

  const cmdHandlers = {
    [REQUEST_CMD.CONNECT]: () => {
      const remote = this.remote = net.connect(config.serverPort, config.serverHost)

      remote.on('connect', () => {
        const reply = new Buffer(data.length)
        data.copy(reply)
        reply[1] = REPLIES_REP.SUCCEEDED

        this.write(reply)
        this.status = 2
        // remote.setNoDelay(true)

        /**
         * 对返回数据解密
         */
        const decipher = encrypt.getDecipher(config.password)
        remote.pipe(decipher).pipe(this)
        // 主要目的是将host跟port加密发送
        remote.write(encrypt.encrypt(reply, config.password))

        /**
         * 加密发送数据
         */
        const cipher = encrypt.getCipher(config.password)
        this.pipe(cipher).pipe(remote)
      })

      remote.on('error', (err) => {
        console.error(`remote socket error: ${err.code}\n${err.message}\n`)
      })
      remote.on('end', () => {
        this.end()
      })
      remote.on('close', (err) => {
        if (err) {
          this.destroy()
        } else {
          this.end()
        }
      })
    }

    // [REQUEST_CMD.UDP_ASSOCIATE]: () => {

    // }

    // [REQUEST_CMD.BIND]: () => {

    // }
  }

  if (cmdHandlers[cmd]) {
    cmdHandlers[cmd]()
  } else {
    console.log(`unsupported cmd: ${cmd}`)
  }
}

module.exports = {
  run: run
}
