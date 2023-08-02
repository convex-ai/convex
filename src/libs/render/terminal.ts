export type LogOptions = {
  tree?: boolean
  tree_end?: boolean

}

export class Terminal {
  public padding = 0;
  private out: (msg: string) => void;

  constructor(out: (msg: string) => void) {
    this.out = out
  }

  log(msg?: string, options?: LogOptions): void {
    if (msg){
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
}
