import {Command, Flags} from '@oclif/core'
import {checkOpenAIKey} from '../libs/ai/models/openai'
import * as chalk from 'chalk'
import {Terminal} from '../libs/render/terminal'
import {CodeSpaceFS} from '../libs/codespace/fs'
import {exit} from '@oclif/core/lib/errors'
import {RunProps} from '../libs/ai/types/run-props'
import * as fs from 'node:fs'
import {Memory} from '../libs/memory/in-memory'
import {ProtocolAgent} from '../libs/ai/agents/spec/protocol/protocol'
import {OpenAPIAgent} from '../libs/ai/agents/spec/openapi'
import {PrismaAgent} from '../libs/ai/agents/spec/prisma/prisma'
import {ApiGenerator} from '../libs/ai/agents/generator/api'
import {PagesGenerator} from '../libs/ai/agents/generator/pages'
import {OpenAIPlugin} from '../libs/ai/agents/spec/openai-plugin/opneai-plugin'
const workpath = '/Users/wph95/Work/hackathon/2023-pingcap/convex_test'
export default class Run extends Command {
  static description = 'input your idea, convex will generate a full app for you'

  static flags = {
    showSpec: Flags.boolean({char: 'S', description: 'print spec detail', required: false}),
    verbose: Flags.boolean({char: 'v', description: 'print verbose detail', required: false}),
    input: Flags.string({char: 'i', description: 'input idea', required: false}),
    spec: Flags.string({char: 's', description: 'spec file path', required: false}),
    openapi: Flags.string({char: 'o', description: 'openapi file path', required: false}),
    skip_api: Flags.boolean({description: 'skip api generation', required: false}),
    skip_page: Flags.boolean({description: 'skip pages generation', required: false}),
    story: Flags.boolean({description: 'enable story mode', required: false}),
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

    props.console.send('ceo', `Hi, Focus! Our client needs an app. The requirement is \n"${idea}"\n@CTO, Could you design the project?"`, [{name: 'ceo', direction: 'f', status: 'talking'}, {name: 'cto', direction: 'r', status: 'thinking'}, {name: 'engineer', direction: 'f', status: 'thinking'}])
    await  new ProtocolAgent(props).run(idea)
    props.console.send('cto', 'Sure, I will design the project.', [{name: 'ceo', direction: 'l', status: 'thinking'}, {name: 'cto', direction: 'f', status: 'talking'}, {name: 'engineer', direction: 'f', status: 'thinking'}])
    props.console.send('cto', '@Engineer please review my architecture', [{name: 'ceo', direction: 'b', status: 'idle'}, {name: 'cto', direction: 'f', status: 'talking'}, {name: 'engineer', direction: 'f', status: 'thinking'}])
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

    if (flags.story) {
      terminal.log('Story mode enabled.')
      terminal.log('https://convex.dev/play?link=localhost:18181')
      terminal.log('waiting for client connection...')
      let count = 0
      while (count < 60) {
        count += 1
        if (terminal.wsReady) {
          break
        }

        // eslint-disable-next-line no-await-in-loop,no-promise-executor-return
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      if (!terminal.wsReady) {
        this.error('websocket connection failed')
        exit(1)
        return
      }
    }

    if (flags.spec) {
      props.memory.load_spec(fs.readFileSync(flags.spec, 'utf8'))
    } else {
      await this.createSpec(flags.input ?? '', props)
    }

    await new PrismaAgent(props).generate()
    // eslint-disable-next-line no-promise-executor-return
    await new Promise(resolve => setTimeout(resolve, 2000))
    props.console.sendCTOWithEng('cto', 'Prisma Schema is perfect, I tested it locally. format, lint, and generate prisma client.')

    if (flags.openapi) {
      props.memory.load_openapi(fs.readFileSync(flags.openapi, 'utf8'))
    } else {
      await new OpenAPIAgent(props).generate()
    }

    if (!flags.skip_api) {
      await new ApiGenerator(props).run()
      props.console.sendCTOWithEng('cto', 'APIs are perfect, I tested it locally. format, lint, and generate api client.')
    }

    const plugins = props.memory.spec?.plugins
    if (plugins && plugins.openai_plugin) {
      await new OpenAIPlugin(props).generate()
    }

    if (!flags.skip_page) {
      await new PagesGenerator(props).run()
      props.console.send('cto', 'Pages are perfect, I tested it locally. @CEO, could we publish it?', [{name: 'ceo', direction: 'l', status: 'thinking'}, {name: 'cto', direction: 'r', status: 'talking'}, {name: 'engineer', direction: 'f', status: 'thinking'}])
      // eslint-disable-next-line no-promise-executor-return
      await new Promise(resolve => setTimeout(resolve, 2000))
      props.console.send('ceo', 'Sure, Let me publish it.', [{name: 'ceo', direction: 'f', status: 'money'}, {name: 'cto', direction: 'f', status: 'cup'}, {name: 'engineer', direction: 'f', status: 'cup'}])
    }

    this.log('Build success!')
    props.console.log('🚀Build success!')
    exit(0)
  }
}
