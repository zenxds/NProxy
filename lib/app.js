'use strict'

// thanks to:
// https://imququ.com/post/web-proxy.html
// https://github.com/qgy18/proxy-demo

const fs = require('fs')
const net = require('net')
const http = require('http')
const https = require('https')
const parse_url = require('url').parse

const Config = require('../config.json')
const Package = require('../package.json')

var log = function() {}
var error = function() {}

function connect(request, socket) {
    log(`receive connect request ${request.url}`)
    let parse = parse_url('http://' + request.url)

    let soc = net.connect(parse.port, parse.hostname, () => {
        socket.write('HTTP/1.1 200 Connection Established\r\n\r\n')
        soc.pipe(socket)
    }).on('error', (e) => {
        error(`connect request error ${e.message}`)
        socket.end()
    })

    socket.pipe(soc)
}

function request(request, response) {
    log(`receive request ${request.url}`)
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
        error(`http request error ${e.message}`)
        response.end()
    })

    request.pipe(req)
}

let run = (options) => {
    let port = options.port || Config.port
    let debug = options.debug || false

    if (debug) {
        log = function(msg) {
            console.log(msg)
        }
        error = function(msg) {
            console.error(msg)
        }
    }

    console.log(`${Package.name} version: ${Package.version}`)
    console.log(`debug: ${debug}`)

    https.createServer({
        key: fs.readFileSync('./private.pem'),
        cert: fs.readFileSync('./public.crt')
    })
    .on('connect', connect)
    .on('request', request)
    .listen(port, '0.0.0.0', () => {
        console.log(`${Package.name} is running at ${port}`)
    })
}

module.exports = {
    run: run
}
