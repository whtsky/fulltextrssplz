import { sign } from '../sign'

if (process.argv.length !== 4) {
  console.log(`Usage: ${process.argv[0]} ${process.argv[1]} <key> <url>`)
} else {
  const args = process.argv.slice(2)
  console.log(sign(args[1], args[0]))
}
