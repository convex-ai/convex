import {Agent, HandleMessageFunc} from '../../agent'
import {RunProps} from '../../../types/run-props'
import Prompt from '../../../utils/prompt'
import {Operation} from '../../spec/openapi/schema'
import * as chalk from 'chalk'

interface IApis {
  [key: string]: Operation
}

export class ApiAgent extends Agent {
  constructor(path: string, props: RunProps, apis: IApis) {
    const PROMPT = Prompt.prompt(`
You are a frontend engineer.  
and you are currently using TypeScript, NextJS, Prisma to write a API based on the entity information and API feature request.
Your colleagues who are conversing with you will provide you all info. 

1. Think step by step and pay attention to the boundary conditions
2. use have relation field Entity

=== Example Code 
import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string; 
  const {name} = req.body;
  
  // POST /api/team
  // Create a new team
  if (req.method == 'POST') {
    const team = await prisma.team.create({
      data: {
        name: name,
        createdAt: new Date()
      }
    });
    return res.json(team);
  }
  // GET /api/team
  // Get all teams
  if (req.method == 'GET') {
...
  }
  return res.status(405).json({msg: 'Method not supported'});
}
===
 ${Prompt.getSchemaPrompt({
    typeName: 'Response',
    schema: `type Response = {
// file path, end-with ".ts", start with "pages/api", 
// example: pages/api/user/[id].ts, pages/api/user.ts
filepath: string
// just typescript code.
content: string
    `,
  })}
  `)

    const handleMessage: HandleMessageFunc = msg => {
      for (const key of Object.keys(apis)) {
        const api = apis[key]
        props.console.log(`Generate ${chalk.bgCyan(key.toUpperCase())} ${chalk.underline(api.operationId)}`)
      }

      const funcs = Object.keys(apis).map(key => apis[key].operationId).join(', ')

      this.console.sendCTOWithEng('engineer', `I've generated the API code for ${path}. include ${funcs}`)

      const data = JSON.parse(msg.content ?? '{}')

      props.fs.writeFileSync(data.filepath, data.content)
    }

    super('API', {...props, system_prompt: PROMPT, handleMessage}, path)
  }
}
