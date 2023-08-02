// {
//   "name": "<Endpoint name1>",
//   "description": "<Endpoint description1>",
//   "method": "<HTTP method1>",
//   "endpoint": "<Endpoint path1>",
//   "data_source": {
//   "cluster_id": <Cluster ID1>
// },
//   "params": [],
//   "settings": {
//   "timeout": <Endpoint timeout>,
//     "row_limit": <Maximum rows>
// },
//   "tag": "Default",
//   "batch_operation": <0 | 1>,
//   "sql_file": "<SQL file directory1>",
//   "type": "sql_endpoint",
//   "return_type": "json"
// },

type TiDBServiceEndpoint = {
  name: string
  description: string
  method: 'POST' | 'GET' | 'PUT' | 'DELETE'
  // endpoint path. e.g. /api/user
  endpoint: string
  tag: string
  batch_operation: 0 | 1
  // sql file is a path, sql/${method}-${endpoint}.sql
  sql_file: string
  type: 'sql_endpoint'
  return_type: 'json'
}

type TiDBService = {
  endpoints: TiDBServiceEndpoint[]
}
