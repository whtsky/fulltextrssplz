import express from 'express'
import bodyParser from 'body-parser'
import Parser from 'rss-parser'
import { generateRssFeed, generateJsonFeed } from 'feedsmith'
import * as Sentry from '@sentry/node'
import { RewriteFrames } from '@sentry/integrations'

import * as constants from './constants'
import { parsePageUsingMercury } from './parser'
import { verify } from './sign'
import { getCache } from './cache'

const app = express()
const cache = getCache({
  mode: constants.cacheMode,
  url: constants.redisUrl,
  ttl: constants.cacheTtl
})

enum Format {
  RSS,
  JSON,
}

if (constants.sentryDsn) {
  Sentry.init({
    dsn: constants.sentryDsn,
    integrations: [
      new RewriteFrames({
        root: __dirname || process.cwd(),
      }),
    ],
    ignoreErrors: [
      /Status code 5\d{2}/,
      /Status code 4\d{2}/,
      /Feed not recognized as/,
      /certificate has expired/,
      "ESOCKETTIMEDOUT",
      "read ECONNRESET",
    ]
  })

  app.use(Sentry.Handlers.requestHandler())
}

app.use(express.static(constants.publicPath))

app.use(bodyParser.urlencoded({ extended: false }))

interface FeedData {
  title: string
  description?: string
  link: string
  image?: string
  items: Array<{
    title: string
    link: string
    date: Date
    content?: string
    description?: string
    creator?: string
    categories?: string[]
    guid?: string
  }>
}

async function getFullTextFeed(feedUrl: string, maxItemsPerFeed: number): Promise<FeedData> {
  const parser = new Parser()
  try {
    const feed = await parser.parseURL(feedUrl)

    const items = await Promise.all((feed.items || []).filter(item => !!item.link).slice(0, maxItemsPerFeed).map(async item => {
      let content: string | undefined = await cache.get(item.link!)
      if (!content) {
        content = (await parsePageUsingMercury(item.link!)).content
        await cache.set(item.link!, content)
      }
      return {
        ...item,
        title: item.title!,
        link: item.link!,
        date: new Date(item.pubDate!),
        content,
        description: item.contentSnippet || item.content,
      }
    }))

    return {
      title: feed.title!,
      description: feed.description,
      link: feedUrl,
      image: feed.image?.url,
      items,
    }
  } catch (e) {
    if (constants.sentryDsn) {
      Sentry.captureException(e)
    }
    return {
      title: `Failed to get fulltext rss for ${feedUrl}.`,
      link: feedUrl,
      items: [{
        title: `Failed to get fulltext rss for ${feedUrl}.`,
        content: `Exception: ${e}`,
        link: 'https://github.com/whtsky/fulltextrssplz/issues',
        date: new Date(),
      }],
    }
  }
}

function feedToRss(data: FeedData): string {
  return generateRssFeed({
    ...data,
    description: data.description || '',
    image: data.image ? { url: data.image } : undefined,
    items: data.items.map(item => ({
      ...item,
      pubDate: item.date,
      guid: item.guid ? { value: item.guid } : undefined,
      dc: item.creator ? { creator: item.creator } : undefined,
      content: item.content ? { encoded: item.content } : undefined,
      categories: item.categories?.map(name => ({ name })),
    })),
  }, { lenient: true })
}

function feedToJson(data: FeedData): string {
  return JSON.stringify(generateJsonFeed({
    ...data,
    home_page_url: data.link,
    items: data.items.map(item => ({
      ...item,
      id: item.guid || item.link,
      url: item.link,
      date_published: item.date,
      content_html: item.content,
      authors: item.creator ? [{ name: item.creator }] : undefined,
    })),
  }, { lenient: true }))
}

app.get('/feed', async (req, res) => {
  const feedUrl = req.query.url

  if (!feedUrl || typeof feedUrl !== 'string') {
    res.end('no feed url')
    return
  }

  if (constants.keys.length) {
    const sign = req.query.sign
    if (!sign || typeof sign !== 'string') {
      res.end('no sign')
      return
    }
    if (!verify(feedUrl, sign, constants.keys)) {
      res.end('bad sign')
      return
    }
  }
  let format = Format.RSS

  if (req.query.format) {
    switch (String(req.query.format).toLowerCase()) {
      case 'json':
        format = Format.JSON
        break
      case 'rss':
        format = Format.RSS
        break
      default:
        res.end('unsupported format: ' + req.query.format)
        return
    }
  }

  let maxItemsPerFeed = constants.maxItemsPerFeed
  if (req.query.max_items) {
    const maxItems = Number(req.query.max_items)
    if (maxItems < maxItemsPerFeed) {
      maxItemsPerFeed = maxItems
    }
  }

  const feedData = await getFullTextFeed(feedUrl, maxItemsPerFeed)

  if (constants.cacheControlMaxAge > 0) {
    res.set('Cache-control', `public, max-age=${constants.cacheControlMaxAge}`)
  }

  if (format == Format.RSS) {
    res.set('Content-type', 'application/rss+xml;charset=UTF-8')
    res.end(feedToRss(feedData))
  } else if (format == Format.JSON) {
    res.set('Content-type', 'application/json;charset=UTF-8')
    res.end(feedToJson(feedData))
  } else {
    res.end('unknown format:' + format)
  }
})

if (constants.sentryDsn) {
  app.use(Sentry.Handlers.errorHandler())
}

export default app
