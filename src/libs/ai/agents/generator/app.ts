import {RunProps} from '../../types/run-props'
import {PrismaAgent} from '../spec/prisma/prisma'
import {ApiGenerator} from './api'
import {OpenAPIAgent} from '../spec/openapi'
import {PagesGenerator} from './pages'

export class AppGenerator {
  private props: RunProps;

  constructor(props: RunProps) {
    this.props = props
  }

  async run(): Promise<void> {
    const {memory} = this.props

    await new PrismaAgent(this.props).generate()

    const input = {
      prisma: memory.prisma,
      spec: memory.spec,
    }
    await new OpenAPIAgent(this.props).run(JSON.stringify(input))

    await new ApiGenerator(this.props).run()

    await new PagesGenerator(this.props).run()
  }
}
