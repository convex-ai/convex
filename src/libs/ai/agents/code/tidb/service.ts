import {Agent, HandleMessageFunc} from '../../agent'
import {RunProps} from '../../../types/run-props'
import Prompt from '../../../utils/prompt'
import * as fs from 'node:fs'

export class TiDBServiceAgent extends Agent {
  constructor(path: string, props: RunProps) {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.ts'), 'utf8')
    const PROMPT = Prompt.prompt(`
You are a  engineer.  
your are use OPENAPI json to transform to A Response Data

=== Example Code 
 {
    "name": "<Endpoint name1>",
    "description": "<Endpoint description1>",
    "method": "POST",
    "endpoint": "/todo/create",
    "params": [],
    "settings": {
      "timeout": 1000,
      "row_limit": 1000
    },
    "tag": "Default",
    "batch_operation":0,
    "sql_file": "<METHOD>-<ENDPONT>.sql",
    "type": "sql_endpoint",
    "return_type": "json"
  }
===
 ${Prompt.getSchemaPrompt({
    typeName: 'TiDBService',
    schema: schema,
  })}
  `)

    const handleMessage: HandleMessageFunc = msg => {
      this.fs.writeFileSync('tidb/config.json', msg.content ?? '')
    }

    super('TiDB/Service', {...props, system_prompt: PROMPT, handleMessage}, path)
  }
}
