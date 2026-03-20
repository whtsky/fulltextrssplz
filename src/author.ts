import type { Item, Author } from 'feed/lib/typings'

export function parseCreator(creator: string): Author {
  const match = creator.match(/^(\S+@\S+)\s+\((.+)\)$/)
  if (match) {
    return { email: match[1], name: match[2] }
  }
  return { name: creator }
}

export function addDcCreators(rssXml: string, items: Item[]): string {
  let result = rssXml
  let searchFrom = 0

  for (const item of items) {
    const closeIdx = result.indexOf('</item>', searchFrom)
    if (closeIdx === -1) break

    if (item.author?.length && item.author[0].name) {
      const name = item.author[0].name.replace(/]]>/g, ']]]]><![CDATA[>')
      const newlinePos = result.lastIndexOf('\n', closeIdx)
      const itemIndent = result.substring(newlinePos + 1, closeIdx)
      const childIndent = itemIndent + '    '
      const dcLine = '\n' + childIndent + `<dc:creator><![CDATA[${name}]]></dc:creator>`
      result = result.slice(0, newlinePos) + dcLine + result.slice(newlinePos)
      searchFrom = closeIdx + dcLine.length + '</item>'.length
    } else {
      searchFrom = closeIdx + '</item>'.length
    }
  }

  if (!result.includes('xmlns:dc=')) {
    result = result.replace(
      'version="2.0"',
      'version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/"'
    )
  }

  return result
}
