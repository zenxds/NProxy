'use strict'
const fs = require('fs')
const yargs = require('yargs')
const util = require('util')
const ARGS = yargs.argv

const localConfig = fs.existsSync('./config.json') ? require('./config.json') : {}
const pkg = require('./package.json')

const config = {
  debug: !!ARGS.d,
  name: pkg.name,
  version: pkg.version
}

if (ARGS.t) {
  require('./lib/tunnel').run(Object.assign(config, {
    port: 1337
  }, localConfig.tunnel || {}))
}

if (ARGS.c) {
  require('./lib/client').run(Object.assign(config, {
    port: 1113,
    password: '',
    serverHost: '',
    serverPort: 8883
  }, localConfig.client || {}))
}

if (ARGS.s) {
  require('./lib/server').run(Object.assign(config, {
    port: 8883,
    password: '',
    clientHost: '127.0.0.1',
    clientPort: 1113
  }, localConfig.server || {}))
}
