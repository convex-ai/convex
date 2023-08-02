import {RunProps} from '../../types/run-props'
import {exit} from '@oclif/core/lib/errors'
import {ApiAgent} from '../code/api/api-agent'

export class ApiGenerator {
  private props: RunProps;
  constructor(props: RunProps) {
    this.props = props
  }

  async run(): Promise<void> {
    const {memory: {openapi, prisma}} = this.props
    if (!openapi) {
      this.props.console.log('!!! openapi load fail !!!')
      exit(255)
      return
    }

    for (const path of Object.keys(openapi.paths)) {
      const apis = openapi.paths[path]
      if (apis) {
        const input = {
          path,
          info: openapi.info,
          prisma,
          operations: apis,
          components: openapi.components,
        }
        // eslint-disable-next-line no-await-in-loop
        await new ApiAgent(path, this.props, apis).run(JSON.stringify(input))
      }
    }
  }
}
