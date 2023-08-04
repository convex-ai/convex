import {Agent, HandleMessageFunc} from '../../agent'
import {RunProps} from '../../../types/run-props'
import Prompt from '../../../utils/prompt'
const PREFIX = `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
`
export class PrismaAgent extends Agent {
  constructor(props: RunProps) {
    const PROMPT = Prompt.prompt(`
You are a frontend engineer.  
and you are currently using TypeScript to write a Prisma schema file based on the entities' information.
Your colleagues who are conversing with you will provide you with entities information.
only response prisma schema file content.
=== PRISMA FILE EXAMPLE ===

model User {
  id            String    @id @default(cuid())
  name          String
  email         String?   @unique
}
===
only response prisma schema file content.
  `)

    const handleMessage: HandleMessageFunc = msg => {
      this.memory.set_prisma(msg.content ?? '')
      props.fs.writeFileSync('prisma/schema.prisma', `${PREFIX}\n${msg.content ?? ''}`)
      this.console.sendCTOWithEng('engineer', '@CTO, it\'s looks good. I will generated prisma client. please review it.')
    }

    super('Spec/Prisma', {...props, system_prompt: PROMPT, handleMessage})
  }

  generate = async (): Promise<void> => {
    const entities = this.memory.spec?.entities ?? []
    await this.run(JSON.stringify(entities))
  }
}
