import { Chat, initiateChat } from "./openai.js"
import { SearchResults, formatResultAsString, search } from "./search.js"
import { getPrompt } from "./utils.js"

async function getInitialWebQuery(chat: Chat, userInput: string) {
  const prompt = await getPrompt('get-query.txt', { 'user-input': userInput })
  let result = await chat(prompt)
  while (result.length > 1000) {
    result = await chat('Sorry, that query is too long. Please try again, but with a search query less than 1000 characters.')
  }
  return result
}

const SEARCH_CHOICE = {
  CHOOSE: /CHOOSE (\d+)/,
  SEARCH: /SEARCH (.+)/,
  GIVE_UP: /GIVE UP/
}
async function chooseFromSearch(chat: Chat, searchResults: SearchResults): Promise<`CHOOSE ${number}` | `SEARCH ${string}` | `GIVE UP`> {
  // chat can response with CHOOSE {number}, SEARCH {string}, or GIVE UP
  const digestableResults = searchResults.map(formatResultAsString).join('\n')
  const choosePrompt = await getPrompt('parse-results.txt', { 'web-results': digestableResults})
  let result = await chat(choosePrompt)
  while (!Object.values(SEARCH_CHOICE).some(regex => regex.test(result))) {
    result = await chat("Sorry, that wasn't a valid response. Please try again.")
  }
  return result as any
}

export async function getDocumentation(prompt: string): Promise<string | null> {
  const context = await getPrompt('context.txt')
  const chat = await initiateChat(context)

  const initialQuery = await getInitialWebQuery(chat, prompt)
  let searchResults = await search(initialQuery)
  let attempts = 0
  while (attempts < 8) {
    const chosenResult = await chooseFromSearch(chat, searchResults)
    if (SEARCH_CHOICE.GIVE_UP.test(chosenResult)) {
      console.log(`Sorry, I couldn't find any documentation for "${prompt}"`)
      return null
    } else if (SEARCH_CHOICE.SEARCH.test(chosenResult)) {
      const newQuery = SEARCH_CHOICE.SEARCH.exec(chosenResult)![1]
      searchResults = await search(newQuery)
    } else {
      const chosenIndex = Number(SEARCH_CHOICE.CHOOSE.exec(chosenResult)![1])
      const chosenWebsite = searchResults[chosenIndex - 1]
      const url = chosenWebsite.url
      return url
    }
  }
  console.log("Failed to find documentation after 8 search attempts")
  return null
}