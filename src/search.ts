import { exponentialBackoff } from "./utils.js"
import fetch, { Response } from 'node-fetch'

const API_KEY = process.env.SEARCH_API_KEY
if (!API_KEY) throw new Error('Missing SEARCH_API_KEY environment variable containing Bing Search API key')
const ENDPOINT = 'https://api.bing.microsoft.com/v7.0/search'
const HEADERS = {
  'Ocp-Apim-Subscription-Key': API_KEY
} as const

type SearchResponse = {
  webPages: {
    webSearchUrl: string
    totalEstimatedMatches: number
    value: [
      {
        id: string
        name: string
        url: string
        displayUrl: string
        snippet: string
        language: string
      }
    ]
  }
}
export type SearchResult = SearchResponse['webPages']['value'][number]
export type SearchResults = SearchResult[]

export async function search(query: string): Promise<SearchResults> {
  console.log(`Searching for "${query}"`)
  const endpoint = `${ENDPOINT}?q=${encodeURIComponent(query)}`
  const get = () => fetch(endpoint, { headers: HEADERS }).then(response => response.json())
  const data = await exponentialBackoff(get) as SearchResponse
  return data.webPages.value
}

export function formatResultAsString(searchResult: SearchResults[number], index: number) {
  return [
    `SEARCH RESULT ${index + 1}`,
    `URL: ${searchResult.url}`,
    `Name: ${searchResult.name}`,
    `Snippet: ${searchResult.snippet}`,
    `Language: ${searchResult.language}`,
    ''
  ].join('\n')
}