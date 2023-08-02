import {ChatCompletionRequestMessage} from 'openai/api'
import {chatCompletion} from '../models/openai'
import {DEFAULT_CONFIG} from '../../config'
import {ux} from '@oclif/core'
import * as chalk from 'chalk'
import {Terminal} from '../../render/terminal'
import {RunProps} from '../types/run-props'
import {CodeSpaceFS} from '../../codespace/fs'
import {Memory} from '../../memory/in-memory'

export type HandleMessageFunc = (msg: ChatCompletionRequestMessage) => void

export interface AgentProps {
  handleMessage?: HandleMessageFunc
  system_prompt: string
}

export class Agent {
  public verbose: boolean
  public system_prompt: string
  public console: Terminal;
  public fs: CodeSpaceFS;
  private handleMessageFn?: HandleMessageFunc;
  private namespace: string;
  public memory: Memory;
  public modelConfig = {
    temperature: 0,
    max_tokens: 2048,
  }

  private description: string | undefined;

  constructor(namespace: string, {
    verbose,
    console,
    system_prompt,
    fs,
    handleMessage,
    memory,
  }: AgentProps & RunProps, description?: string) {
    this.namespace = namespace
    this.verbose = verbose
    this.system_prompt = system_prompt
    this.console = console
    this.fs = fs
    this.memory = memory
    this.description = description
    this.handleMessageFn = handleMessage
  }

  createMsg = (role: 'system' | 'user', content: string) => {
    return {
      role,
      content,
    }
  }

  handleMessage: HandleMessageFunc = (msg: ChatCompletionRequestMessage) => {
    return this.handleMessageFn?.(msg)
  }

  generate = async (): Promise<void> => {
    const entities = this.memory.spec?.entities ?? []
    await this.run(JSON.stringify(entities))
  }

  async run(input: string): Promise<ChatCompletionRequestMessage | undefined> {
    this.console.l_log()
    ux.action.start(`${chalk.bgGreen.bold(this.namespace)} ${this.description ?? ''}     convex is thinking  ...`)

    const messages = [
      this.createMsg('system', this.system_prompt),
      this.createMsg('user', input),
    ]

    const start = Date.now()

    const {data} = await chatCompletion({
      model: DEFAULT_CONFIG.model,
      messages,
      ...this.modelConfig,
    })

    const used = Date.now() - start

    ux.action.stop()

    const msg = data.choices[0].message
    if (this.handleMessage && msg) {
      this.handleMessage(msg)
    }

    if (this.verbose) {
      const usage = data.usage ?? {total_tokens: -1, completion_tokens: -1, prompt_tokens: -1}
      this.console.log(`Used ${chalk.red.underline.bold(used)}ms, token ${chalk.blue.underline.bold(usage.total_tokens)}, [${usage.prompt_tokens}/${usage.completion_tokens}]`, {tree_end: true})
    }

    return msg
  }
}
