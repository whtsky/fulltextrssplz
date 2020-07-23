import express from 'express'
import bodyParser from 'body-parser'
import Parser from 'rss-parser'
import { Feed } from 'feed'
import type { FeedOptions, Item } from 'feed/lib/typings'
import * as Sentry from '@sentry/node'
import { RewriteFrames } from '@sentry/integrations'

import * as constants from './constants'
import { parsePageUsingMercury } from './parser'
import { verify } from './sign'
import { DummyCache } from './cache'

const app = express()
const cache = new DummyCache()

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
  })

  app.use(Sentry.Handlers.requestHandler())
}

app.use(express.static(constants.publicPath))

app.use(bodyParser.urlencoded({ extended: false }))

app.get('/feed', async (req, res) => {
  const parser = new Parser()

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

  const feed = await parser.parseURL(feedUrl)
  const feedOptions: FeedOptions = {
    ...feed,
    title: feed.title!,
    description: feed.description,
    link: feedUrl,
    id: feedUrl,
    image: feed.image?.url,
    copyright: '',
  }
  const outputFeed = new Feed(feedOptions)

  for (const item of (feed.items || []).slice(0, maxItemsPerFeed)) {
    if (!item.link) {
      continue
    }
    const newItem: Item = {
      ...item,
      title: item.title!,
      link: item.link!,
      date: new Date(item.pubDate!),
    }
    let content: string | undefined = await cache.get(item.link)
    if (!content) {
      content = (await parsePageUsingMercury(item.link)).content
      await cache.set(item.link, content)
    }
    newItem.content = content
    outputFeed.addItem(newItem)
  }

  if (format == Format.RSS) {
    res.set('Content-type', 'application/rss+xml;charset=UTF-8')
    res.end(outputFeed.rss2())
  } else if (format == Format.JSON) {
    res.set('Content-type', 'application/json;charset=UTF-8')
    res.end(outputFeed.json1())
  } else {
    res.end('unknown format:' + format)
  }
})

if (constants.sentryDsn) {
  app.use(Sentry.Handlers.errorHandler())
}

export default app
