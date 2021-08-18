import path from 'path'

export const maxItemsPerFeed = Number(process.env.MAX_ITEMS_PER_FEED || 3)
export const cacheControlMaxAge = Number(process.env.CACHE_CONTROL_MAXAGE || 1800)
export const cacheMode = process.env.CACHE_MODE
export const redisUrl = process.env.REDIS_URL
export const cacheTtl = process.env.CACHE_TTL ? Number(process.env.CACHE_TTL) : undefined
export const sentryDsn = process.env.SENTRY_DSN
export const keys = (process.env.KEYS || '').split(',').filter(Boolean)
export const publicPath = path.join(__dirname, '../public')
