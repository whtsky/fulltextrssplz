import Parser from 'rss-parser'
import { generateRssFeed, generateJsonFeed } from 'feedsmith'

const FEEDS = [
  'https://news.un.org/feed/subscribe/en/news/all/rss.xml',
  'https://github.com/FreshRSS/FreshRSS/releases.atom',
  'https://www.aliasvault.net/rss.xml',
]

async function testFeed(feedUrl: string) {
  console.log(`\n${'='.repeat(80)}`)
  console.log(`Testing: ${feedUrl}`)
  console.log('='.repeat(80))
  
  const parser = new Parser()
  const feed = await parser.parseURL(feedUrl)
  
  console.log(`\nFeed title: ${feed.title}`)
  console.log(`Feed description: ${feed.description}`)
  console.log(`Feed link: ${feed.link}`)
  console.log(`Feed image: ${feed.image?.url}`)
  console.log(`Item count: ${feed.items?.length}`)
  
  // Show first 2 items
  const items = (feed.items || []).slice(0, 2)
  for (const item of items) {
    console.log(`\n--- Item: ${item.title} ---`)
    console.log(`  link: ${item.link}`)
    console.log(`  pubDate: ${item.pubDate}`)
    console.log(`  creator: ${item.creator}`)
    console.log(`  author: ${(item as any).author}`)
    console.log(`  guid: ${item.guid}`)
    console.log(`  categories: ${JSON.stringify(item.categories)}`)
    console.log(`  content (first 100): ${item.content?.substring(0, 100)}`)
    console.log(`  contentSnippet (first 100): ${item.contentSnippet?.substring(0, 100)}`)
    console.log(`  isoDate: ${item.isoDate}`)
    // Show all keys
    console.log(`  all keys: ${Object.keys(item).join(', ')}`)
  }
  
  // Try generating RSS feed output
  const feedData = {
    title: feed.title!,
    description: feed.description || '',
    link: feedUrl,
    image: feed.image?.url ? { url: feed.image.url } : undefined,
    items: items.filter(item => !!item.link).map(item => ({
      ...item,
      title: item.title!,
      link: item.link!,
      pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
      guid: item.guid ? { value: item.guid } : undefined,
      dc: item.creator ? { creator: item.creator } : undefined,
      content: item.content ? { encoded: item.content } : undefined,
      categories: item.categories?.map((name: string) => ({ name })),
    })),
  }
  
  try {
    const rss = generateRssFeed(feedData as any, { lenient: true })
    console.log(`\nRSS output (first 500):`)
    console.log(rss.substring(0, 500))
    console.log(`\nRSS total length: ${rss.length}`)
    
    // Check for key fields in output
    console.log(`  Has dc:creator: ${rss.includes('dc:creator')}`)
    console.log(`  Has content:encoded: ${rss.includes('content:encoded')}`)
    console.log(`  Has <link>: ${rss.includes('<link>')}`)
    console.log(`  Has <title>: ${rss.includes('<title>')}`)
    console.log(`  Has <pubDate>: ${rss.includes('<pubDate>')}`)
  } catch (e) {
    console.error(`\nRSS generation FAILED:`, e)
  }
  
  // Try generating JSON feed output
  try {
    const jsonItems = items.filter(item => !!item.link).map(item => ({
      ...item,
      id: item.guid || item.link!,
      url: item.link!,
      date_published: item.pubDate ? new Date(item.pubDate) : new Date(),
      content_html: item.content,
      authors: item.creator ? [{ name: item.creator }] : undefined,
    }))
    
    const json = generateJsonFeed({
      title: feed.title!,
      home_page_url: feedUrl,
      description: feed.description,
      items: jsonItems,
    } as any, { lenient: true })
    
    console.log(`\nJSON feed output (first 500):`)
    console.log(JSON.stringify(json).substring(0, 500))
  } catch (e) {
    console.error(`\nJSON feed generation FAILED:`, e)
  }
}

async function main() {
  for (const feedUrl of FEEDS) {
    try {
      await testFeed(feedUrl)
    } catch (e) {
      console.error(`\nFATAL ERROR for ${feedUrl}:`, e)
    }
  }
}

main()
