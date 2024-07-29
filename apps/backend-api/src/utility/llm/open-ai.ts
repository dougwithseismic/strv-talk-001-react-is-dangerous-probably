import OpenAI from 'openai'

const openAi = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORG_ID,
})


export default openAi