#! /usr/bin/env node
'use strict'

const yargs = require('yargs')
const Package = require('../package.json')

var ARGS = yargs
    .usage('$0 [options]')
    .describe('d', 'enable debug mod')
    .alias('d', 'debug')
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

require('../index')