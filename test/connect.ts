import https from 'https'
import { SocksProxyAgent } from 'socks-proxy-agent'
import getPort from 'get-port'

import Client from '../src/client'

type Server = [string, number]

const clientConfig = require('../config.js').client
const servers: Server[] = [
  ['', 80],
  ['', 443],
  ['', 8886]
]

async function test(server: Server): Promise<number | string> {
  const port = await getPort({ port: 3000 })
  return new Promise(resolve => {
    const config = {
      clientPort: port,
      serverHost: server[0],
      serverPort: server[1]
    }

    if (!config.serverHost) {
      delete config.serverHost
    }

    const client = new Client(Object.assign({}, clientConfig, config))
    const s = client.createServer()
    s.listen(port, '0.0.0.0', (): void => {
      const start = Date.now()
      const agent = new SocksProxyAgent(`socks://127.0.0.1:${port}`)
      https
        .get('https://www.google.com', { agent }, res => {
          // console.log('statusCode:', res.statusCode)
          resolve(Date.now() - start)
          s.close()
        })
        .on('error', err => {
          resolve('err: ' + err.message)
          s.close()
        })
    })
  })
}

async function start(): Promise<void> {
  const results = await Promise.all(servers.map(server => test(server)))

  results.forEach((result, index) => {
    const server = servers[index]

    console.log(`${server[1]} ${result}`)
  })
}

start()
  .then(() => {
    process.exit(0)
  })
  .catch(() => {
    process.exit(1)
  })
