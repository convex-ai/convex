export type Schema = {
  type: 'object'
  properties: {
    [key: string]: Schema
  }
  required: keyof ['properties'][]
} | { type: 'string' | 'number' | 'boolean' }
  | { type: 'array', items: Schema }
  // reference to other schema, only support #/components/schemas/{name}
  | { $ref: string }

export type Content = {
  'application/json': {
    schema: Schema
  }
}

export type Response = {
  description: string
  content: Content
} | {
  // reference to other responses, only support #/components/responses/{name}
  $ref: string
}

export type Operation = {
  operationId: string
  summary: string

  requestBody: {
    content: Content
  }

  responses: {
    // status_code example 200, 401, 500
    [status_code: string]: Response
  }
}
export type Info = {
  title: string
  version: 'v1'
  description: string
}

export type OpenAPI = {
  openapi: '3.0.1',
  info: Info,
  paths: {
    // example /api/user, /api/user/[id]
    [path: string]: {
      // example get, post, put, delete
      [method: string]: Operation
    }
  }
  components: {
    schemas: {
      [name: string]: Schema
    },
    responses: {
      [name: string]: Response
    }
  }
}
