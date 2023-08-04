import * as fs from 'node:fs'
import * as path from 'node:path'
import {Agent, HandleMessageFunc} from '../../agent'
import Prompt from '../../../utils/prompt'
import {RunProps} from '../../../types/run-props'
import {OpenAI, SubOpenAI} from './schema'

export class OpenAIPlugin extends Agent {
  constructor(props: RunProps) {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.ts'), 'utf8')
    const PROMPT = Prompt.prompt(`
    You are a senior engineer. You have been given an JSON file(include project description, api info). Based on this information, you generate a json in the following format.
  ${Prompt.getSchemaPrompt({
    typeName: 'SubOpenAI',
    schema: schema,
  })}
  `)

    super('Spec/OpenAI_Plugin', {...props, system_prompt: PROMPT})
  }

  handleMessage: HandleMessageFunc = msg => {
    const rawPlugin = JSON.parse(msg.content ?? '') as SubOpenAI
    const {renderConfig: {origin}, openapi} = this.memory
    const plugin: OpenAI = {
      ...rawPlugin,
      schema_version: 'v1',
      api: {
        type: 'openapi',
        url: `${origin}/openapi.json`,
        has_user_authentication: false,
      },
      auth: {
        type: 'none',
      },
      logo_url: `${origin}/logo.png`,
      contact_email: 'hi@concex.com',
      legal_info_url: `${origin}/legal`,
    }

    this.fs.writeFileSync('public/.well-known/ai-plugin.json', JSON.stringify(plugin))
    this.fs.writeFileSync('public/openapi.json', JSON.stringify(openapi))
    this.console.sendCTOWithEng('engineer', "I've created the OpenAI Plugin Manifest.")
  }

  generate = async (): Promise<void> => {
    const {spec} = this.memory
    const apis = spec?.apis ?? []

    const input = `
APIS:\n${apis.map(v => `- ${v.operationId}\n`)}
Info:
  title: ${spec?.info.title}
  description: ${spec?.info.description} 
`
    await this.run(input)
  }
}

