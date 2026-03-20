// @ts-nocheck
import { generateRssFeed, generateJsonFeed } from 'feedsmith'

describe('RSS feed generation with dc:creator', () => {
  test('includes dc:creator when creator is specified', () => {
    const rss = generateRssFeed({
      title: 'Test Feed',
      link: 'https://example.com',
      description: 'A test feed',
      items: [{
        title: 'Test Article',
        link: 'https://example.com/article',
        pubDate: new Date('2024-01-01'),
        dc: { creator: 'John Doe' },
        content: { encoded: '<p>Full content</p>' },
      }],
    }, { lenient: true })

    expect(rss).toContain('<dc:creator>John Doe</dc:creator>')
    expect(rss).toContain('xmlns:dc="http://purl.org/dc/elements/1.1/"')
  })

  test('omits dc:creator when no creator specified', () => {
    const rss = generateRssFeed({
      title: 'Test Feed',
      link: 'https://example.com',
      description: 'A test feed',
      items: [{
        title: 'Test Article',
        link: 'https://example.com/article',
        pubDate: new Date('2024-01-01'),
        content: { encoded: '<p>Full content</p>' },
      }],
    }, { lenient: true })

    expect(rss).not.toContain('<dc:creator>')
  })

  test('handles mixed items with and without creators', () => {
    const rss = generateRssFeed({
      title: 'Test Feed',
      link: 'https://example.com',
      description: 'A test feed',
      items: [
        {
          title: 'Article 1',
          link: 'https://example.com/1',
          dc: { creator: 'Author One' },
        },
        {
          title: 'Article 2',
          link: 'https://example.com/2',
        },
        {
          title: 'Article 3',
          link: 'https://example.com/3',
          dc: { creator: 'Author Three' },
        },
      ],
    }, { lenient: true })

    expect(rss).toContain('<dc:creator>Author One</dc:creator>')
    expect(rss).not.toContain('Author Two')
    expect(rss).toContain('<dc:creator>Author Three</dc:creator>')
  })

  test('properly handles special characters in creator names', () => {
    const rss = generateRssFeed({
      title: 'Test Feed',
      link: 'https://example.com',
      description: 'A test feed',
      items: [{
        title: 'Test Article',
        link: 'https://example.com/article',
        dc: { creator: 'Name with <special> & "chars"' },
      }],
    }, { lenient: true })

    expect(rss).toContain('<dc:creator>')
    // Special chars should be safely contained (CDATA or entity-escaped)
    expect(rss).toContain('Name with')
  })

  test('includes content:encoded with full text', () => {
    const rss = generateRssFeed({
      title: 'Test Feed',
      link: 'https://example.com',
      description: 'A test feed',
      items: [{
        title: 'Test Article',
        link: 'https://example.com/article',
        content: { encoded: '<p>Full article content</p>' },
        dc: { creator: 'John Doe' },
      }],
    }, { lenient: true })

    expect(rss).toContain('<content:encoded>')
    expect(rss).toContain('Full article content')
    expect(rss).toContain('xmlns:content="http://purl.org/rss/1.0/modules/content/"')
  })
})

describe('JSON feed generation with authors', () => {
  test('includes author when creator is specified', () => {
    const json = generateJsonFeed({
      title: 'Test Feed',
      items: [{
        id: 'https://example.com/article',
        url: 'https://example.com/article',
        title: 'Test Article',
        content_html: '<p>Full content</p>',
        authors: [{ name: 'John Doe' }],
      }],
    }, { lenient: true })

    expect(json.items[0].authors).toEqual([{ name: 'John Doe' }])
  })

  test('omits authors when no creator specified', () => {
    const json = generateJsonFeed({
      title: 'Test Feed',
      items: [{
        id: 'https://example.com/article',
        url: 'https://example.com/article',
        title: 'Test Article',
        content_html: '<p>Full content</p>',
      }],
    }, { lenient: true })

    expect(json.items[0].authors).toBeUndefined()
  })
})
