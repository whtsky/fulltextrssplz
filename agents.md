# Agents

## Success Criteria for Feed Processing

The fulltext RSS proxy must be able to process the following feeds without any issue, with full content retrieved, and essential fields kept:

### Test Feeds

1. **UN News RSS** — `https://news.un.org/feed/subscribe/en/news/all/rss.xml`
   - Standard RSS 2.0 feed

2. **FreshRSS Atom** — `https://github.com/FreshRSS/FreshRSS/releases.atom`
   - Atom feed format
   - Author is in `<author><name>...</name></author>` (mapped to `item.author` by rss-parser, not `item.creator`)
   - Entry ID is in `<id>` (mapped to `item.id`, not `item.guid`)

3. **AliasVault RSS** — `https://www.aliasvault.net/rss.xml`
   - RSS 2.0 with `<dc:creator>` elements (Dublin Core namespace)
   - Has categories per item
   - `item.creator` maps directly from rss-parser

### Essential Fields

For each feed item in the output:

| Field | RSS Output | JSON Feed Output |
|-------|-----------|-----------------|
| Title | `<title>` | `title` |
| Link | `<link>` | `url` |
| Date | `<pubDate>` | `date_published` |
| Full content | `<content:encoded>` | `content_html` |
| Description | `<description>` | `summary` |
| Author/Creator | `<dc:creator>` | `authors[].name` |
| Categories | `<category>` | `tags` |
| GUID/ID | `<guid>` | `id` |

### Author Handling

- RSS feeds with `<dc:creator>`: mapped via `item.creator` from rss-parser
- Atom feeds with `<author>`: mapped via `item.author` from rss-parser (fallback when `item.creator` is absent)
- Output as `<dc:creator>` in RSS and `authors` array in JSON Feed
