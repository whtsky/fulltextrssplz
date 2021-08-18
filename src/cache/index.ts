
import { DummyCache } from './dummy'
import { RedisCache } from './redis'
import type { Cache } from './type'

export interface CacheOptions {
  mode: string | undefined
  ttl: number | undefined
  url: string | undefined
}

export function getCache(options: CacheOptions): Cache {
  if (options.mode == "redis") {
    if (!options.url) {
      throw new Error("url is not provided")
    }
    return new RedisCache(options.url, options.ttl)
  }
  return new DummyCache()
}

export { DummyCache, RedisCache}