'use strict'
const net = require('net')
const util = require('util')

const parsers = require('./parsers')
const encryptor = require('./encryptor')

function onConnection(socket, config) {
    socket.status = 0
    let host
    let port
    let remote = null

    let parseRemote = (data) => {
        let offset = 3
        let parsed = parsers[data[offset]](data, offset)
        host = parsed[0]
        port = parsed[1]
    }

    let handleData = () => {
        remote = net.connect(port, host)

        /**
         * 解密，发送原文到真正的服务器
         */
        let decipher = encryptor.getDecipher(config.password)
        socket.pipe(decipher).pipe(remote)

        /**
         * 将结果加密返回
         */
        let cipher = encryptor.getCipher(config.password)
        remote.pipe(cipher).pipe(socket)

        remote.on('error', (err) => {
            console.error(`server remote error: ${err.message}`)
            remote.end()
        })
    }

    socket.on('data', function(data) {

        if (socket.status === 0) {
            /**
             * 解密第一个包，得到host和port
             */
            data = encryptor.decrypt(data, config.password)
            parseRemote(data)
            socket.status = 1

            /**
             * 开始发送请求，得到结果返回
             */
            handleData()
        }
    })

    socket.on('error', (err) => {
        console.error(`server socket error: ${err.message}`)
        socket.end()
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