import express from 'express'
import bodyParser from 'body-parser'
import Parser from 'rss-parser'
import { Feed } from 'feed'
import type { FeedOptions, Item } from 'feed/lib/typings'
import Sentry from '@sentry/node'
import { RewriteFrames } from '@sentry/integrations'

import { parsePageUsingMercury } from './parser'
import { verify } from './sign'
import { DummyCache } from './cache'

const port = process.env.PORT || 3000
const maxItemPerFeed = 3
const sentryDsn = process.env.SENTRY_DSN
const keys = (process.env.KEYS || '').split(',')

const app = express()
const cache = new DummyCache()

enum Format {
  RSS,
  JSON,
}

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [
      new RewriteFrames({
        root: __dirname || process.cwd(),
      }),
    ],
  })

  app.use(Sentry.Handlers.requestHandler())
}

app.use(bodyParser.urlencoded({ extended: false }))

app.get('/feed', async (req, res) => {
  const parser = new Parser()

  const feedUrl = req.query.url

  if (!feedUrl || typeof feedUrl !== 'string') {
    res.end('no feed url')
    return
  }

  const sign = req.query.sign
  if (!sign || typeof sign !== 'string') {
    res.end('no sign')
    return
  }
  if (!verify(feedUrl, sign, keys)) {
    res.end('bad sign')
    return
  }
  let format = Format.RSS

  if (req.query.format) {
    if (req.query.format == 'json') {
      format = Format.JSON
    } else {
      res.end('unsupported format: ' + req.query.format)
      return
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

  for (const item of (feed.items || []).slice(0, maxItemPerFeed)) {
    if (!item.link) {
      continue
    }
    console.log(item.link)
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

if (sentryDsn) {
  app.use(Sentry.Handlers.errorHandler())
}

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
