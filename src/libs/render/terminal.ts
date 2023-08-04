import {WebSocketServer} from 'ws'

export type LogOptions = {
  tree?: boolean
  tree_end?: boolean
}
type PersonStatus = 'idle' | 'talking' | 'thinking' | 'money' | 'cup'

export type IUpdate = Partial<Person> & { name: string }

export interface Person {
  direction: 'l' | 'r' | 'f' | 'b'
  status: PersonStatus
  name: string
  pos: {
    x: number
    y: number
  }
}

export interface IMessage {
  role: string
  content: string
  update?: IUpdate[]
}

export class Terminal {
  public padding = 0;
  private out: (msg: string) => void;
  public wsReady = false;
  ws?: WebSocket

  constructor(out: (msg: string) => void) {
    this.out = out

    const wss = new WebSocketServer({port: 18_181})
    wss.on('connection', (ws: WebSocket) => {
      this.wsReady = true
      this.ws = ws
    })
  }

  log(msg?: string, options?: LogOptions): void {
    if (msg) {
      this.out(`${this.getPadding(options)}${msg}`)
    }

    this.checkTreeEnd(options)
  }

  getPadding = (options?: LogOptions): string => {
    if (this.padding === 0) {
      return ''
    }

    const indent = ' '.repeat(this.padding)
    if (options?.tree_end) {
      return `${indent}└── `
    }

    if (options?.tree) {
      return `${indent}├── `
    }

    return indent
  }

  checkTreeEnd = (options?: LogOptions): void => {
    if (options?.tree_end) {
      this.padding -= 2
    }
  }

  l_log(msg?: string, options?: LogOptions): void {
    this.padding += 2
    this.log(msg, options)
  }

  r_log(msg?: string, options?: LogOptions): void {
    this.padding -= 2
    this.log(msg, options)
  }

  send(role: 'cto' | 'ceo' | 'engineer', content: string, update?: IUpdate[]): void {
    const msg: IMessage = {role, content, update}
    if (this.wsReady && this.ws) {
      this.ws.send(JSON.stringify(msg))
    }
  }

  sendCTOWithEng(role: 'cto' | 'engineer', content: string): void {
    const msg: IMessage = {
      role, content, update: [
        {name: 'cto', direction: 'l', status: role === 'cto' ? 'talking' : 'thinking'},
        {name: 'engineer', direction: 'r', status: role === 'engineer' ? 'talking' : 'thinking'},
      ],
    }
    if (this.wsReady && this.ws) {
      this.ws.send(JSON.stringify(msg))
    }
  }
}
