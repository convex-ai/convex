import {Configuration, OpenAIApi} from 'openai'
import {ChatCompletionRequestMessage} from 'openai/api'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

export const checkOpenAIKey = async (): Promise<void> => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not defined')
  }

  const models = await openai.listModels()
  if (models.status !== 200) {
    throw new Error('OPENAI_API_KEY is invalid')
  }
}

type  IChatCompletion  = (props:{
  model: string
  messages: ChatCompletionRequestMessage[]
  temperature?: number
  max_tokens?: number
})=> any
export const chatCompletion:IChatCompletion = async ({model = 'gpt-4', messages, temperature, max_tokens})  => {
  return openai.createChatCompletion({
    model,
    messages,
    temperature,
    max_tokens,
  })
}

