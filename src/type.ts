export interface ClientOptions {
  serverHost: string
  serverPort?: number
  password: string
  iv: string
}

export interface ServerOptions {
  port?: number
  password: string
  iv: string
}
