'use strict'

const net = require('net')
const http = require('http')
const parse_url = require('url').parse

const Config = require('../config.json')
const Package = require('../package.json')

function connect(request, socket) {

    let parse = parse_url('http://' + request.url)

    let soc = net.connect(parse.port, parse.hostname, () => {
        socket.write('HTTP/1.1 200 Connection Established\r\n\r\n')
        soc.pipe(socket)
    }).on('error', (e) => {
        socket.end()
    })

    socket.pipe(soc)
}

function request(request, response) {
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
        response.end()
    })

    request.pipe(req)
}

let run = (port) => {
    console.log(`${Package.name} version: ${Package.version}`)

    port = port || Config.port

    http.createServer()
    .on('connect', connect)
    .on('request', request)
    .listen(port, '0.0.0.0', () => {
        console.log(`${Package.name} client is running at ${port}`)
    })
}

module.exports = {
    run: run
}
