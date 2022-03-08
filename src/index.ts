import path from 'path'
import fs from 'fs'
import yargs from 'yargs'

import Client from './client'
import Server from './server'

const args = yargs.argv

const localConfigFile = (args.config as string) || path.join(__dirname, '../config.js')
const localConfig = fs.existsSync(localConfigFile)
  ? require(localConfigFile)
  : {}

if (args.c) {
  const config = Object.assign(
    {
      serverHost: '',
      serverPort: 8886,
      clientPort: 1113,
      password: '',
      iv: '',
      header: ''
    },
    localConfig.client || {}
  )
  const client = new Client(config)
  const service = client.createServer()

  service.listen(config.clientPort, '0.0.0.0', (): void => {
    console.log('client is running at ' + config.clientPort)
  })
}

if (args.s) {
  const config = Object.assign(
    {
      port: 8886,
      password: '',
      iv: '',
      header: ''
    },
    localConfig.server || {}
  )
  const server = new Server(config)
  const service = server.createServer()

  service.listen(config.port, '0.0.0.0', (): void => {
    console.log('server is running at ' + config.port)
  })
}
