const http = require('http')
const https = require('https')
const net = require('net')
const parse_url = require('url').parse

const Request = require('request')

var config = require('../config.json')

http.createServer((request, response) => {
    // var parsed = parse_url(request.url)
    // var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress

    console.log(request.url)
    var proxy = Request(request.url)
    request.pipe(proxy).pipe(response)

}).listen(config.port, () => {

  console.log(`NProxy server running at ${config.port}`)

});