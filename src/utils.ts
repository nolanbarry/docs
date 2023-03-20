import { readFile } from "fs/promises"
import dotenv from "dotenv"

dotenv.config()

export const DEBUG = process.env.DEBUG === 'true'

/** Call the given function with exponential backoff until it works */
export function exponentialBackoff(func: () => Promise<any>, maxRetries: number = 5) {
  let delay = 10
  return new Promise((resolve, reject) => {
    let retries = 0
    const retry = () => {
      func().then(resolve).catch((err) => {
        if (retries++ < maxRetries) {
          setTimeout(retry, delay)
          delay *= 1.5
        } else {
          reject(err)
        }
      })
    }
    retry()
  })
}

export async function getPrompt(filename: `${string}.txt`, input?: Record<string, string>) {
  const rawPrompt = (await readFile('prompts/' + filename)).toString()
  if (!input) return rawPrompt
  let parsedPrompt = rawPrompt
  for (const [key, value] of Object.entries(input))
    parsedPrompt = parsedPrompt.replace(`\${${key}}`, value)

  return parsedPrompt
}