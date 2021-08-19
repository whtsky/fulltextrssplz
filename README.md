# fulltextrssplz

Make RSS full text.

## Example

Full-text version of [UN News](https://news.un.org/feed/subscribe/en/news/all/rss.xml): https://fulltextrssplz.whtsky.me/feed?url=https://news.un.org/feed/subscribe/en/news/all/rss.xml&format=RSS

## Start Server

### PaaS

[![Deploy To Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/whtsky/fulltextrssplz)

### with Docker

```bash
docker run --restart=always -p 127.0.0.1:3000:80 -e MAX_ITEMS_PER_FEED=5 -d ghcr.io/whtsky/fulltextrssplz:master
```

### without Docker

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
- `url`: URL to original feed
- `sign`: required for protected mode. hexadecimal HMAC signature of the feed url
- `max_items`: max items for this feed. Can't be greater than `MAX_ITEMS_PER_FEED` environment variable.

You can get sign using

```bash
yarn sign <your_key> <feed_url>
```

## Environment Variables

|                 name |                                                      description | default value |
| -------------------: | ---------------------------------------------------------------: | ------------: |
|             HOSTNAME |                                  hostname HTTP server listens to |     `0.0.0.0` |
|                 PORT |                                      port HTTP server listens to |        `3000` |
|                 KEYS |  comma-seperated signing keys. Leave empty to run in public mode |     `<emtpy>` |
|   MAX_ITEMS_PER_FEED |                                               max items per feed |           `3` |
| CACHE_CONTROL_MAXAGE | Set max age in `Cache-Control` header. Use `0` to disable cache. |        `1800` |
|           CACHE_MODE |   `redis` for cache with redis, other values means disable cache |     `<empty>` |
|            REDIS_URL |                                                    URL for redis |     `<empty>` |
|            CACHE_TTL |                                                        Cache TTL |     `<empty>` |
