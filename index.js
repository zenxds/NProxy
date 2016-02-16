'use strict'

const yargs = require('yargs')
const util = require('util')
const ARGS = yargs.argv

let Config = {}
try {
    Config = require('./config.json')
} catch (e) {}
const Package = require('./package.json')

let config = {
    debug: !!ARGS.d,
    name: Package.name,
    version: Package.version
}

if (ARGS.t) {
    require('./lib/tunnel').run(Object.assign(config, {
        port: 1337
    }, Config.tunnel))
}

if (ARGS.c) {
    require('./lib/client').run(Object.assign(config, {
        port: 1113,
        password: '',
        // method: 'aes-256-cfb',
        serverHost: '',
        serverPort: 8883
    }, Config.client))
}

if (ARGS.s) {
    require('./lib/server').run(Object.assign(config, {
        port: 8883,
        password: '',
        // method: 'aes-256-cfb',
        clientHost: '127.0.0.1',
        clientPort: 1113
    }, Config.server))
}
