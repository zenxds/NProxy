const http = require('http')
const net = require('net')
const parse_url = require('url').parse

function request(request, response) {
  /**
   * nginx proxy
   * proxy_set_header        X-PROXY-URL $scheme://$host$request_uri;
   */
  const url = request.headers['x-proxy-url'] || request.url
  const parse = parse_url(url)
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

function connect(request, socket) {
  const parse = parse_url(`http://${request.url}`)
  const soc = net.connect(parse.port, parse.hostname, () => {
    socket.write('HTTP/1.1 200 Connection Established\r\n\r\n')
    soc.pipe(socket)
  }).on('error', (e) => {
    console.error(`connect request error ${e.message}`)
    socket.end()
  })

  socket.pipe(soc)
}

http.createServer()
  .on('connect', connect)
  .on('request', request)
  .listen(8888, '0.0.0.0')