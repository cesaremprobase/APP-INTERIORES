import OpenAI from 'openai'

// Lazy initialization
let openai: OpenAI | null = null

export function getOpenAIClient() {
    if (!openai) {
        if (!process.env.OPENAI_API_KEY) {
            console.error('OPENAI_API_KEY is missing')
            throw new Error('OpenAI API Key not configured')
        }
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        })
    }
    return openai
}
