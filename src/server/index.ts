import net from 'net'

import Socket from './socket'
import { ServerOptions } from '../type'

export default class Server {
  options: ServerOptions

  constructor(options: ServerOptions) {
    this.options = options
  }

  createServer(): net.Server {
    const server = net.createServer()

    server.on('connection', (socket): void => {
      new Socket(
        Object.assign(
          {
            socket,
          },
          this.options,
        ),
      )
    })

    return server
  }
}
