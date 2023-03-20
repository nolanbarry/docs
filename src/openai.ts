import { DEBUG, exponentialBackoff } from "./utils.js"
import fetch, { Response } from 'node-fetch'
import chalk from 'chalk'

const API_KEY = process.env.OPENAI_API_KEY
if (!API_KEY) throw new Error('Missing OPENAI_API_KEY environment variable containing OpenAI API key')
const MODEL = 'gpt-3.5-turbo'
const ENDPOINT = 'https://api.openai.com/v1/chat/completions'
const HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`
} as const

type ChatMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

type ChatResponse = {
  message: ChatMessage,
  finish_reason: 'length' | 'stop' | 'content_filter' | 'null'
  index: number
}

export type Chat = (message: string) => Promise<string>

export function initiateChat(context: string): Chat {

  const messages: ChatMessage[] = [
    { 'role': 'system', content: context },
  ]

  return async function (message: string) {
    messages.push({ 'role': 'user', content: message })

    if (DEBUG) console.log(`\n${chalk.bold.blue('[DOCS]')}:\n${message}`)

    const get = () => fetch(ENDPOINT, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({ model: MODEL, messages })
    })

    const response = await exponentialBackoff(get) as Response
    const data = await response.json() as { choices: [ChatResponse] } | { error: { message: string } }

    if ('error' in data) throw new Error(`OpenAI API error: ${data.error.message}`)
    const chatResponse = data.choices[0]
    if (chatResponse.finish_reason !== 'stop') throw new Error(`OpenAI API failed to complete chat with finish reason: ${chatResponse.finish_reason}`)
    messages.push(chatResponse.message)
    if (DEBUG) console.log(`\n${chalk.bold.blue('[GPT]')}:\n${chatResponse.message.content}`)
    return chatResponse.message.content
  }
}

