import { getDocumentation } from "./docs.js";

const prompt = process.argv.slice(2).join(' ')
if (!prompt) {
  console.log('Usage: node main.ts <prompt>')
  process.exit(1)
}
getDocumentation(prompt).then(url => {
  if (url) {
    console.log(`Found documentation at ${url}`)
  }
})