# fulltextrssplz

Make rss full text.

## Installation

```bash
# install dependencies
yarn

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
