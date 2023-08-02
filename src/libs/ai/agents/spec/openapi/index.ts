import * as fs from 'node:fs'
import * as path from 'node:path'
import {Agent, HandleMessageFunc} from '../../agent'
import Prompt from '../../../utils/prompt'
import {RunProps} from '../../../types/run-props'

export class OpenAPIAgent extends Agent {
  constructor(props: RunProps) {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.ts'), 'utf8')
    const PROMPT = Prompt.prompt(`
  You are a senior programmer working on designing a project based on the idea provided by the product manager. 
  You will create a OpenAPI 3.0.1 schema file for development.
  1. page cover all operation. 2. ensure have a index page, can access all page from it
  3. all apis from user input, is defined in the openapi json.
  ${Prompt.getSchemaPrompt({
    typeName: 'OpenAPI',
    schema: schema,
  })}
  `)

    super('Spec/OpenAPI', {...props, system_prompt: PROMPT})
  }

  handleMessage: HandleMessageFunc = msg => {
    const openapi = msg.content ?? ''
    this.fs.writeFileSync('.convex/openapi.json', openapi)
    this.memory.load_openapi(openapi)
  }

  generate = async (): Promise<void> => {
    const {spec, prisma} = this.memory
    const apis = spec?.apis ?? []

    const input = `apis:\n${apis.map(v => `- ${v.operationId}\n`)}=== START Prisma Schema\n${prisma}\n`
    await this.run(input)
  }
}

