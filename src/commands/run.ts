import {Command, Flags} from '@oclif/core'
import {checkOpenAIKey} from '../libs/ai/models/openai'
import * as chalk from 'chalk'
import {Terminal} from '../libs/render/terminal'
import {CodeSpaceFS} from '../libs/codespace/fs'
import {exit} from '@oclif/core/lib/errors'
import {RunProps} from '../libs/ai/types/run-props'
import * as fs from 'node:fs'
import {Memory} from '../libs/memory/in-memory'
import {AppGenerator} from '../libs/ai/agents/generator/app'
import {ProtocolAgent} from '../libs/ai/agents/spec/protocol/protocol'
import {OpenAPIAgent} from '../libs/ai/agents/spec/openapi'
import {PrismaAgent} from '../libs/ai/agents/spec/prisma/prisma'
import {ApiGenerator} from '../libs/ai/agents/generator/api'
import {PagesGenerator} from '../libs/ai/agents/generator/pages'
const workpath = '/Users/wph95/Work/hackathon/2023-pingcap/convex_test'
export default class Run extends Command {
  static description = 'input your idea, convex will generate a full app for you'

  static flags = {
    showSpec: Flags.boolean({char: 'S', description: 'print spec detail', required: false}),
    verbose: Flags.boolean({char: 'v', description: 'print verbose detail', required: false}),
    input: Flags.string({char: 'i', description: 'input idea', required: false}),
    spec: Flags.string({char: 's', description: 'spec file path', required: false}),
    openapi: Flags.string({char: 'o', description: 'openapi file path', required: false}),
    skip_apis: Flags.boolean({description: 'skip api generation', required: false}),
  }

  getDescription(): Promise<string> {
    return new Promise((resolve, reject) => {
      process.stdin.setEncoding('utf8')
      let data = ''

      process.stdin.on('readable', () => {
        let chunk
        while ((chunk = process.stdin.read()) !== null) {
          data += chunk
        }
      })

      process.stdin.on('end', () => {
        resolve(data)
      })

      process.stdin.on('error', err => {
        reject(err)
      })
    })
  }

  toLog = (v: string) => this.log(v)

  async createSpec(input: string, props: RunProps): Promise<void> {
    let idea = input

    if (!idea) {
      this.log('\nPlease input your idea:')
      this.log(chalk.green(`========  use ${chalk.underline.green('Ctrl + D')} to End  ========`))
      idea = await this.getDescription()
      this.log(chalk.green('\n================================='))
    }

    if (!idea) {
      this.error('idea is required')
      exit(1)
      return
    }

    this.log("\nGot it, Let's start\n")
    this.log(chalk.green('++++++++++++++++++++++++++++++\n'))

    await  new ProtocolAgent(props).run(idea)
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(Run)
    await checkOpenAIKey()
    const terminal = new Terminal(this.toLog)
    const props = {
      verbose: flags.verbose,
      console: terminal,
      fs: new CodeSpaceFS(workpath, flags.verbose, terminal),
      memory: new Memory(),
    }

    if (flags.spec) {
      props.memory.load_spec(fs.readFileSync(flags.spec, 'utf8'))
    } else {
      await this.createSpec(flags.input ?? '', props)
    }

    await new PrismaAgent(props).generate()

    if (flags.openapi) {
      props.memory.load_openapi(fs.readFileSync(flags.openapi, 'utf8'))
    } else {
      await new OpenAPIAgent(props).generate()
    }

    if (!flags.skip_apis) {
      await new ApiGenerator(props).run()
    }

    await new PagesGenerator(props).run()

    this.log('Build success!')
  }
}
