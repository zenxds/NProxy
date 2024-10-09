import path from 'path'
import fs from 'fs'

import Client from './client'
import Server from './server'

const configFile = path.join(__dirname, '../config.js')
const localConfig = fs.existsSync(configFile) ? require(configFile) : {}
const env = localConfig.type || process.env.PROXY_TYPE || 'client'

if (env === 'client') {
  const config = Object.assign(
    {
      serverHost: '',
      serverPort: 8886,
      clientPort: 1113,
      password: '',
      iv: '',
      header: '',
    },
    localConfig.client || {},
  )
  const client = new Client(config)
  const service = client.createServer()

  service.listen(config.clientPort, '0.0.0.0', (): void => {
    console.log('client is running at ' + config.clientPort)
  })
} else {
  const config = Object.assign(
    {
      port: 8886,
      password: '',
      iv: '',
      header: '',
    },
    localConfig.server || {},
  )
  const server = new Server(config)
  const service = server.createServer()

  service.listen(config.port, '0.0.0.0', (): void => {
    console.log('server is running at ' + config.port)
  })
}
