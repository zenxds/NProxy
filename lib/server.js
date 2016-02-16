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
        let decipher = encryptor.getDecipher(config.password)
        let cipher = encryptor.getCipher(config.password)
        socket.pipe(decipher).pipe(remote)
        remote.pipe(cipher).pipe(socket)
    }

    socket.on('data', function(data) {

        if (socket.status === 0) {
            data = encryptor.decrypt(data, config.password)

            parseRemote(data)
            socket.status = 1

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