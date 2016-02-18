'use strict'
const net = require('net')
const util = require('util')

const parse = require('./parse')
const encrypt = require('./encrypt')

let handleData = (host, port, config) => {
    let remote = this.remote = net.connect(port, host)

    /**
     * 解密，发送原文到真正的服务器
     */
    let decipher = encrypt.getDecipher(config.password)
    this.pipe(decipher).pipe(remote)

    /**
     * 将结果加密返回
     */
    let cipher = encrypt.getCipher(config.password)
    remote.pipe(cipher).pipe(this)

    remote.on('error', (err) => {
        console.error(`server remote error: ${err.code}\n${err.message}\n`)
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

function onConnection(socket, config) {
    socket.status = 0
    socket.remote = null

    socket.on('data', function(data) {

        if (this.status === 0) {
            /**
             * 解密第一个包，得到host和port
             */
            data = encrypt.decrypt(data, config.password)

            let parsed = parse(data)
            let host = parsed[0]
            let port = parsed[1]

            this.status = 1
            /**
             * 开始发送请求，得到结果返回
             */
            handleData.bind(this)(host, port, config)
        }
    })

    socket.on('error', (err) => {
        console.error(`server socket error: ${err.code}\n${err.message}\n`)
    })

    socket.on('end', function() {
        this.remote && this.remote.end()
    })

    socket.on('close', function(had_error) {
        if (had_error) {
            this.remote && this.remote.destroy()
        } else {
            this.remote && this.remote.end()
        }
    })
}

/**
 * socks5代理服务器部分
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
        console.info(`${config.name} server is running at ${config.port}`)
    })
}

module.exports = {
    run: run
}