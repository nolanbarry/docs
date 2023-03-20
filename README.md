# `docs`
`docs` is (will be) a commandline tool utilizing the Bing Search API and GPT 3.5 to search the web for official documentation, skipping the need to search through W3Schools, GeekforGeeks, etc. and instead getting the official documentation from the source.

## Getting Started
This repo is not yet built for ease-of-use, but you can install it locally if you'd like. You'll need to get generate a Bing Search API key and
OpenAI key, which should go in `src/.env`:
```txt
OPENAI_API_KEY=<open ai key>
SEARCH_API_KEY=<bing web search api key>
DEBUG=true # optional, provide more information about the internal chat occuring with gpt
```
Then, you can run `npm install` and use `node` with `ts-node` to run the typescript directly:
```bash
node --no-warnings --loader ts-node/esm src/main.ts <search term>
```