import * as fs from 'node:fs'
import * as path from 'node:path'
import {Agent, HandleMessageFunc} from '../../agent'
import Prompt from '../../../utils/prompt'
import {RunProps} from '../../../types/run-props'

export class ProtocolAgent extends Agent {
  constructor(props: RunProps) {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.ts'), 'utf8')
    const PROMPT = Prompt.prompt(`
  You are a senior programmer working on designing a project based on the idea provided by the product manager. 
  You will create a project plan for its development.
  1. page cover all operation. 3. ensure have a index page, can access all page from it
  ${Prompt.getSchemaPrompt({
    typeName: 'Spec',
    schema: schema,
  })}
  `)

    super('Spec/Protocol', {...props, system_prompt: PROMPT})
  }

   handleMessage: HandleMessageFunc = msg => {
     const spec_json = msg.content ?? ''
     this.fs.writeFileSync('.convex/spec.json', spec_json)
     this.memory.load_spec(spec_json)
   }
}

