'use strict'

/**
 * NProxy client部分
 * socks5代理
 */
const net = require('net')
const util = require('util')

const socks = require('./socks5')
const AUTHENTICATION = socks.AUTHENTICATION
const SOCKS_VERSION = socks.SOCKS_VERSION
const REQUEST_CMD = socks.REQUEST_CMD
const REPLIES_REP = socks.REPLIES_REP

const parse = require('./parse')
const encrypt = require('./encrypt')

/**
 * socks5代理client部分
 */
let run = (config) => {
    let debug = config.debug

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
        if (socket.status === 0) {
            next = handshake
        }

        // 第二次请求是请求细节
        if (socket.status === 1) {
            next = handleDetail
        }

        // 后续请求是处理数据，改由pipe实现
        // if (this.status === 2) {
        //     next = handleData
        // }

        next && next.bind(socket)(data)
    })

    socket.on('error', (err) => {
        console.error(`client socket error: ${err.code}\n${err.message}\n`)
    })

    socket.on('end', () => {
        socket.remote && socket.remote.end()
    })

    socket.on('close', (had_error) => {
        if (had_error) {
            socket.remote && socket.remote.destroy()
        } else {
            socket.remote && socket.remote.end()
        }
    })
}

/**
 * 检查socket版本号
 */
function checkVersion(version) {
    if (version !== SOCKS_VERSION) {
        util.log(`socks version ${version} is incorrect`)
        return 1
    }
    return 0
}

/**
 * 握手阶段
 * 协商版本和认证方法
 */
function handshake(data) {
    if (checkVersion(data[0])) {
        this.end()
        return
    }

    let nmethods = data[1]
    let authentications = new Set()
    for (let i = 0; i < nmethods; i++) {
        authentications.add(data[2 + i])
    }

    let reply = new Buffer(2)
    reply[0] = SOCKS_VERSION
    if (authentications.has(AUTHENTICATION.NOAUTH)) {
        reply[1] = AUTHENTICATION.NOAUTH
        this.write(reply)

        // 握手完成
        this.status = 1
    } else {
        util.log('no suported authentication method')
        reply[1] = AUTHENTICATION.NONE
        this.end(reply)
    }
}

/**
 * 处理客户端发来的请求细节
 * 根据请求的内容返回一到多条消息
 */
function handleDetail(data) {
    if (checkVersion(data[0])) {
        this.end()
        return
    }

    let config = this.config

    let cmd = data[1]
    let parsed = parse(data)
    let host = parsed[0]
    let port = parsed[1]

    util.log(`receive cmd ${cmd}: to ${host}:${port}`)

    let cmdHandlers = {
        [REQUEST_CMD.CONNECT]: () => {
            let remote = this.remote = net.connect(config.serverPort, config.serverHost)

            remote.on('connect', () => {
                let reply = new Buffer(data.length)
                data.copy(reply)
                reply[1] = REPLIES_REP.SUCCEEDED

                this.write(reply)
                this.status = 2
                // remote.setNoDelay(true)

                /**
                 * 对返回数据解密
                 */
                let decipher = encrypt.getDecipher(config.password)
                remote.pipe(decipher).pipe(this)

                // 主要目的是将host跟port加密发送
                remote.write(encrypt.encrypt(reply, config.password))
                /**
                 * 加密发送数据
                 */
                let cipher = encrypt.getCipher(config.password)
                this.pipe(cipher).pipe(remote)
            })

            remote.on('error', (err) => {
                console.error(`remote socket error: ${err.code}\n${err.message}\n`)
            })
            remote.on('end', () => {
                this.end()
            })
            remote.on('close', (had_error) => {
                if (had_error) {
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
        util.log(`unsupported cmd: ${cmd}`)
    }
}

module.exports = {
    run: run
}