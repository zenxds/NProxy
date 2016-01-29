const yargs = require('yargs')
const ARGS = yargs.argv

var port = ARGS.p

require('./lib/app').run({
    port: typeof port === "number" ? port : undefined,
    debug: ARGS.d
})