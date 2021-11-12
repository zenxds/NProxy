import net from 'net'

import Socket from './socket'
import { ClientOptions } from './type'

export default class Client {
  options: ClientOptions

  constructor(options: ClientOptions) {
    this.options = options
  }

  createServer(): net.Server {
    const server = net.createServer()

    server.on('connection', (socket): void => {
      new Socket(
        Object.assign(
          {
            socket
          },
          this.options
        )
      )
    })

    return server
  }
}
