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
KEYS=<your_key>[, <your_key_b>] yarn start
```

## Usage

An example request looks like:

```
http://localhost:3000/feed?format=rss&url=<feed_url>[&sign=<your_sign>]
```

Params are:

- `format`: Output in which format. Can be `rss` or `json`
- `url`: url to original feed
- `sign`: required for protected mode. hexadecimal HMAC signature of the feed url

You can get sign using

```bash
yarn sign <your_key> <feed_url>
```
