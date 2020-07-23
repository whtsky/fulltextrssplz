# fulltextrssplz

Make rss full text.

[![Deploy to Vercel](https://vercel.com//button)](https://vercel.com/import/project?template=https://github.com/whtsky/fulltextrssplz)

## Example

Full text version of [UN News](https://news.un.org/feed/subscribe/en/news/all/rss.xml): https://fulltextrssplz.whtsky.me/feed?url=https://news.un.org/feed/subscribe/en/news/all/rss.xml&format=RSS

## Installation

```bash
# install dependencies
yarn

# build frontend codes
yarn build

# start in public mode -- everyone can use
yarn start

# start in protected mode -- only users with key can use
## generate key for signing url
yarn gen_key
KEYS=<your_key>[,<your_key_b>] yarn start
```

## Usage

An example request looks like:

```
http://localhost:3000/feed?format=rss&url=<feed_url>[&sign=<your_sign>][&max_items=1]
```

Params are:

- `format`: Output in which format. Can be `rss` or `json`
- `url`: url to original feed
- `sign`: required for protected mode. hexadecimal HMAC signature of the feed url
- `max_items`: max items for this feed. Can't be greater than `MAX_ITEMS_PER_FEED` environment variable.

You can get sign using

```bash
yarn sign <your_key> <feed_url>
```

## Environment Variables

|               name |                                                     description | default value |
| -----------------: | --------------------------------------------------------------: | ------------: |
|               KEYS | comma-seperated singing keys. Leave empty to run in public mode |       <emtpy> |
| MAX_ITEMS_PER_FEED |                                              max items per feed |             3 |
