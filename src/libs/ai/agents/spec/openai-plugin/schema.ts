export type SubOpenAI= {
  // Human-readable name, such as the full company name. 20 character max
  name_for_human: string
  // Name the model will use to target the plugin (no spaces allowed, only letters and numbers). 50 character max
  name_for_model: string
  // Human-readable description of the plugin. 100 character max.
  description_for_human: string
  // Description better tailored to the model, such as token context length considerations or keyword usage for improved plugin prompting. 8,000 character max.
  description_for_model: string
}

export type OpenAI  = {
  schema_version: string
  auth: {
    type: 'none'
  }
  api: {
    type: 'openapi'
    url: string
    has_user_authentication: boolean
  }
  logo_url: string
  contact_email: string
  legal_info_url: string
} & SubOpenAI
