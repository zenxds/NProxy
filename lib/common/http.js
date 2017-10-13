const http = require('http')
const https = require('https')
const net = require('net')
const parse_url = require('url').parse

function request(request, response) {
  const parse = parse_url(request.url)

  const options = {
    hostname: parse.hostname,
    port: parse.port || 80,
    path: parse.path,
    method: request.method,
    headers: request.headers
  }

  const req = http.request(options, res => {
    response.writeHead(res.statusCode, res.headers)
    res.pipe(response)
  }).on('error', e => {
    response.end()
  })

  request.pipe(req)
}

http.createServer().on('request', request).listen(8888, '0.0.0.0')