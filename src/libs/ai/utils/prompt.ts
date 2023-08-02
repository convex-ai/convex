
export const prompt = (content: string): string => {
  return content.trim()
}

export const getSchemaPrompt = ({typeName, schema}: { typeName: string, schema: string }): string => {
  return ` Respond in the form of JSON. The JSON should have the following format "${typeName}", according to the following TypeScript definitions:\n` +
    `===START SCHEMA\n${schema}\n===END\n` +
    'your response only json string! no other content!\n'
}

export default {
  prompt,
  getSchemaPrompt,
}
