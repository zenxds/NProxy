'use strict'

// thanks to:
// https://imququ.com/post/web-proxy.html
// https://github.com/qgy18/proxy-demo

const fs = require('fs')
const path = require('path')
const net = require('net')
const http = require('http')
const https = require('https')

function resolve(val) {
  return path.resolve(__dirname, val)
}

function onConnect(request, socket) {
  const url = new URL(`http://${request.url}`)
  const soc = net
    .connect(url.port || 80, url.hostname, () => {
      socket.write('HTTP/1.1 200 Connection Established\r\n\r\n')
      soc.pipe(socket)
    })
    .on('error', e => {
      console.error(`connect request error ${e.message}`)
      socket.end()
    })

  socket.pipe(soc)
}

function onRequest(request, response) {
  const req = http
    .request(new URL(request.url), res => {
      response.writeHead(res.statusCode, res.headers)
      res.pipe(response)
    })
    .on('error', e => {
      console.error(`http request error: ${e.message}`)
      response.end()
    })

  request.pipe(req)
}

const run = config => {
  const port = config.port

  const server = config.security
    ? https.createServer({
        key: fs.readFileSync(resolve('./private.pem')),
        cert: fs.readFileSync(resolve('./public.crt')),
      })
    : http.createServer()

  server
    .on('connect', onConnect)
    .on('request', onRequest)
    .listen(port, '0.0.0.0', () => {
      console.info(`tunnel is running at ${port}`)
    })
}

module.exports = {
  run: run,
}
