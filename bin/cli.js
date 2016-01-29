#! /usr/bin/env node
'use strict'

const yargs = require('yargs')
const fs = require('fs')
const Package = require('../package.json')

var app = require('../lib/app')

var ARGS = yargs
    .usage('$0 [options]')
    .describe('p', 'specify the port')
    .alias('p', 'port')
    .describe('v', 'print version')
    .alias('v', 'version')
    .wrap(80)
    .argv

if (ARGS.h || ARGS.help) {
    console.log(yargs.help())
    process.exit(0)
}

if (ARGS.v) {
    console.log(Package.version)
    process.exit(0)
}

var port = ARGS.p
app.run(typeof port === "number" ? port : undefined)
