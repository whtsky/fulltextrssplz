# fulltextrssplz

Make rss full text.

## Installation

```bash
# install dependencies
yarn
# generate key for signing url
yarn gen_key

KEYS=<your_key> yarn start
```

## Usage

An example request looks like:

```
http://localhost:3000/feed?format=rss&sign=<your_sign>&url=<feed_url>
```

Params are:

- `format`: Output in which format. Can be `rss` or `json`
- `url`: url to original feed
- `sign`: hexadecimal HMAC signature of the feed url

You can get sign using

```bash
yarn sign <your_key> <feed_url>
```
