'use strict'

// thanks to:
// https://imququ.com/post/web-proxy.html
// https://github.com/qgy18/proxy-demo

const fs = require('fs')
const path = require('path')
const net = require('net')
const http = require('http')
const https = require('https')
const parse_url = require('url').parse
const util = require('util')

function resolve(val) {
    return path.resolve(__dirname, val)
}

function onConnect(request, socket) {
    util.log(`receive connect request ${request.url}`)

    let parse = parse_url(`http://${request.url}`)
    let soc = net.connect(parse.port, parse.hostname, () => {
        socket.write('HTTP/1.1 200 Connection Established\r\n\r\n')
        soc.pipe(socket)
    }).on('error', (e) => {
        console.error(`connect request error ${e.message}`)
        socket.end()
    })

    socket.pipe(soc)
}

function onRequest(request, response) {
    util.log(`receive request ${request.url}`)
    let parse = parse_url(request.url)

    let options = {
        hostname : parse.hostname,
        port     : parse.port || 80,
        path     : parse.path,
        method   : request.method,
        headers  : request.headers
    }

    let req = http.request(options, (res) => {
        response.writeHead(res.statusCode, res.headers)
        res.pipe(response)
    }).on('error', (e) => {
        console.error(`http request error: ${e.message}`)
        response.end()
    })

    request.pipe(req)
}

let run = (config) => {
    let port = config.port
    let debug = config.debug

    console.info(`${config.name} version: ${config.version}`)
    console.info(`debug: ${debug}`)

    https.createServer({
        key: fs.readFileSync(resolve('../private.pem')),
        cert: fs.readFileSync(resolve('../public.crt'))
    })
    .on('connect', onConnect)
    .on('request', onRequest)
    .listen(port, '0.0.0.0', () => {
        console.info(`${config.name} tunnel is running at ${port}`)
    })
}

module.exports = {
    run: run
}
