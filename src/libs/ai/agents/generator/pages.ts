import {RunProps} from '../../types/run-props'
import {exit} from '@oclif/core/lib/errors'
import {PageAgent} from '../code/page'

export class PagesGenerator {
  private props: RunProps;

  constructor(props: RunProps) {
    this.props = props
  }

  async run(): Promise<void> {
    const {memory: {openapi, spec}} = this.props
    if (!openapi) {
      this.props.console.log('!!! openapi.  load fail !!!')
      exit(255)
      return
    }

    if (!spec) {
      this.props.console.log('!!! spec.  load fail !!!')
      exit(255)
      return
    }

    const pages = spec.pages ?? []
    for (const page of pages) {
      const input = {
        page,
        spec,
        openapi,
      }
      // eslint-disable-next-line no-await-in-loop
      await new PageAgent(`Page/${page.name}`, this.props).run(JSON.stringify(input))
    }
  }
}
