import {Agent, HandleMessageFunc} from '../../agent'
import {RunProps} from '../../../types/run-props'
import Prompt from '../../../utils/prompt'
import {PAGE_PROMPT} from './prompt'

export class PageAgent extends Agent {
  constructor(path: string, props: RunProps) {
    const PROMPT = Prompt.prompt(`${PAGE_PROMPT}
    ${Prompt.getSchemaPrompt({
    typeName: 'Response',
    schema: `type Response = {
// file path, start with pages/api, example: pages/api/user/[id].ts
filepath: string
// just typescript code.
content: string
    `,
  })}
  `)

    const handleMessage: HandleMessageFunc = msg => {
      const data = JSON.parse(msg.content ?? '{}')
      props.fs.writeFileSync(data.filepath, data.content)
    }

    super('Page', {...props, system_prompt: PROMPT, handleMessage}, path)
  }
}
