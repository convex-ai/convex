import {Terminal} from '../../render/terminal'
import {CodeSpaceFS} from '../../codespace/fs'
import {Memory} from '../../memory/in-memory'

export interface RunProps {
  verbose: boolean
  console: Terminal
  fs: CodeSpaceFS
  memory: Memory
}
