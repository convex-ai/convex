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
  plugins: {
    gpt_plugin: boolean // if description want to create a chatgpt plugin, set true
    doc: boolean // default false
    test: boolean // default false
  }
  entities: Entity[]
  apis: Operation[]
  pages: Page[]
  info: Info
}
