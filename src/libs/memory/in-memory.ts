import {Spec} from '../ai/agents/spec/protocol/schema'
import {OpenAPI} from '../ai/agents/spec/openapi/schema'

export class Memory {
  public spec?: Spec
  public prisma = ''
  public openapi?: OpenAPI

  public renderConfig: {
    origin: string
  } = {
    origin: 'https://{!CHANGE_ME!}',
  }

  validate(): boolean {
    //   TODO: https://github.com/microsoft/TypeChat/blob/main/src/validate.ts
    return true
  }

  load_spec(str: string): void {
    this.spec = JSON.parse(str) as Spec
    this.validate()
  }

  load_openapi(str: string): void {
    this.openapi = JSON.parse(str) as OpenAPI
  }

  set_prisma(str: string): void {
    this.prisma = str
  }
}
