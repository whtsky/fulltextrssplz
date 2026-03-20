// @ts-nocheck
import { Feed } from 'feed'
import type { FeedOptions, Item } from 'feed/lib/typings'
import { parseCreator, addDcCreators } from './author'

describe('parseCreator', () => {
  test('parses name-only creator', () => {
    const result = parseCreator('John Doe')
    expect(result).toEqual({ name: 'John Doe' })
  })

  test('parses email (name) format', () => {
    const result = parseCreator('john@example.com (John Doe)')
    expect(result).toEqual({ email: 'john@example.com', name: 'John Doe' })
  })

  test('handles creator with just a username', () => {
    const result = parseCreator('admin')
    expect(result).toEqual({ name: 'admin' })
  })

  test('does not parse invalid email format', () => {
    const result = parseCreator('not-an-email (Name)')
    expect(result).toEqual({ name: 'not-an-email (Name)' })
  })
})

describe('addDcCreators', () => {
  function buildFeedXml(items: Item[]): { xml: string; items: Item[] } {
    const feedOptions: FeedOptions = {
      title: 'Test Feed',
      id: 'https://example.com/feed',
      link: 'https://example.com',
      copyright: '',
    }
    const feed = new Feed(feedOptions)
    for (const item of items) {
      feed.addItem(item)
    }
    return { xml: feed.rss2(), items: feed.items }
  }

  test('adds dc:creator for item with name-only author', () => {
    const items: Item[] = [
      {
        title: 'Test Article',
        link: 'https://example.com/article',
        date: new Date('2024-01-01'),
        content: 'Test content',
        author: [{ name: 'John Doe' }],
      },
    ]
    const { xml, items: feedItems } = buildFeedXml(items)
    const result = addDcCreators(xml, feedItems)

    expect(result).toContain('<dc:creator><![CDATA[John Doe]]></dc:creator>')
    expect(result).toContain('xmlns:dc=')
  })

  test('adds dc:creator for item with email and name author', () => {
    const items: Item[] = [
      {
        title: 'Test Article',
        link: 'https://example.com/article',
        date: new Date('2024-01-01'),
        content: 'Test content',
        author: [{ name: 'John Doe', email: 'john@example.com' }],
      },
    ]
    const { xml, items: feedItems } = buildFeedXml(items)
    const result = addDcCreators(xml, feedItems)

    expect(result).toContain('<dc:creator><![CDATA[John Doe]]></dc:creator>')
    // Should also have <author> element from feed library
    expect(result).toContain('<author>john@example.com (John Doe)</author>')
  })

  test('skips dc:creator for items without author', () => {
    const items: Item[] = [
      {
        title: 'Test Article',
        link: 'https://example.com/article',
        date: new Date('2024-01-01'),
        content: 'Test content',
      },
    ]
    const { xml, items: feedItems } = buildFeedXml(items)
    const result = addDcCreators(xml, feedItems)

    expect(result).not.toContain('<dc:creator>')
  })

  test('handles mixed items with and without authors', () => {
    const items: Item[] = [
      {
        title: 'Article 1',
        link: 'https://example.com/1',
        date: new Date('2024-01-01'),
        content: 'Content 1',
        author: [{ name: 'Author One' }],
      },
      {
        title: 'Article 2',
        link: 'https://example.com/2',
        date: new Date('2024-01-02'),
        content: 'Content 2',
      },
      {
        title: 'Article 3',
        link: 'https://example.com/3',
        date: new Date('2024-01-03'),
        content: 'Content 3',
        author: [{ name: 'Author Three' }],
      },
    ]
    const { xml, items: feedItems } = buildFeedXml(items)
    const result = addDcCreators(xml, feedItems)

    expect(result).toContain('<dc:creator><![CDATA[Author One]]></dc:creator>')
    expect(result).not.toContain('<dc:creator><![CDATA[Author Two]]></dc:creator>')
    expect(result).toContain('<dc:creator><![CDATA[Author Three]]></dc:creator>')
  })

  test('adds xmlns:dc namespace if not present', () => {
    const items: Item[] = [
      {
        title: 'Test Article',
        link: 'https://example.com/article',
        date: new Date('2024-01-01'),
        author: [{ name: 'John Doe' }],
      },
    ]
    const feedOptions: FeedOptions = {
      title: 'Test Feed',
      id: 'https://example.com/feed',
      link: 'https://example.com',
      copyright: '',
    }
    const feed = new Feed(feedOptions)
    for (const item of items) {
      feed.addItem(item)
    }
    // Without content, the feed library won't add xmlns:dc
    const xml = feed.rss2()
    expect(xml).not.toContain('xmlns:dc=')

    const result = addDcCreators(xml, feed.items)
    expect(result).toContain('xmlns:dc="http://purl.org/dc/elements/1.1/"')
    expect(result).toContain('<dc:creator><![CDATA[John Doe]]></dc:creator>')
  })

  test('produces valid XML structure', () => {
    const items: Item[] = [
      {
        title: 'Test Article',
        link: 'https://example.com/article',
        date: new Date('2024-01-01'),
        content: 'Test content',
        author: [{ name: 'John Doe' }],
      },
    ]
    const { xml, items: feedItems } = buildFeedXml(items)
    const result = addDcCreators(xml, feedItems)

    // dc:creator should be inside <item> block
    const itemStart = result.indexOf('<item>')
    const itemEnd = result.indexOf('</item>')
    const dcCreatorIdx = result.indexOf('<dc:creator>')
    expect(dcCreatorIdx).toBeGreaterThan(itemStart)
    expect(dcCreatorIdx).toBeLessThan(itemEnd)
  })

  test('escapes ]]> in author names to prevent CDATA injection', () => {
    const items: Item[] = [
      {
        title: 'Test Article',
        link: 'https://example.com/article',
        date: new Date('2024-01-01'),
        content: 'Test content',
        author: [{ name: 'Evil]]>Author' }],
      },
    ]
    const { xml, items: feedItems } = buildFeedXml(items)
    const result = addDcCreators(xml, feedItems)

    // The ]]> sequence should be escaped by splitting the CDATA section
    expect(result).not.toContain('<dc:creator><![CDATA[Evil]]>Author]]></dc:creator>')
    expect(result).toContain('<dc:creator><![CDATA[Evil]]]]><![CDATA[>Author]]></dc:creator>')
  })
})
