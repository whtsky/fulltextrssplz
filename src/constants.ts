import path from 'path'

export const maxItemsPerFeed = Number(process.env.MAX_ITEMS_PER_FEED || 3)
export const sentryDsn = process.env.SENTRY_DSN
export const keys = (process.env.KEYS || '').split(',').filter(Boolean)
export const publicPath = path.join(__dirname, '../public')
