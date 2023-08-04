export type Field = {
  name: string
  type: 'id' | 'string' | 'number' | 'boolean' | 'datetime' | 'relation'
  // default is undefined
  is_required?: boolean
}

export type Entity = {
  name: string
  fields: Field[]
}

// Operation is a single API endpoint
export type Operation = {
  operationId: string
  relation_entities: string[]
}

export type Page = {
  name: string
  path: string
  relation: {
    // relation operation ids
    operations: string[]
    // relation pages
    pages: string[]
  }
}
export type Info = {
  title: string
  version: 'v1'
  description: string
}

export type Spec = {
  info: Info
  plugins: {
    // if description want to create a chatgpt plugin or openai plugin, set true
    openai_plugin: boolean
    // default false, only if user want to create doc
    doc: boolean
    // default false, only if user want to create test
    test: boolean
  }
  entities: Entity[]
  apis: Operation[]
  pages: Page[]
}
