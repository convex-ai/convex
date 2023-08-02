import * as fs from 'node:fs'

import * as pathlib from 'node:path'
import {LogOptions, Terminal} from '../render/terminal'
import * as chalk from "chalk";

export class CodeSpaceFS {
  private root: string;
  private verbose: boolean;
  private terminal: Terminal;

  constructor(root: string, verbose: boolean, terminal: Terminal) {
    this.root = root
    this.verbose = verbose
    this.terminal = terminal
  }

  log(msg: string, options?: LogOptions): void {
    if (this.verbose) {
      this.terminal.log(msg, options)
    }
  }

  public writeFileSync(relative_path: string, data: string): string {
    const path = pathlib.join(this.root, relative_path)
    const hasDir = fs.existsSync(pathlib.dirname(path))
    if (!hasDir) {
      fs.mkdirSync(pathlib.dirname(path), {recursive: true})
    }

    fs.writeFileSync(path, data)
    this.log(`File: ${chalk.blue.underline(relative_path)}. ${!hasDir ? 'with mkdir' : ''}`, {tree: true})
    return path
  }
}
