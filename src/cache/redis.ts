import type { Cache } from './type'
import type { RedisClient } from 'redis'

export class RedisCache implements Cache {
  redisUrl: string
  client?: RedisClient
  ttl: number | undefined
  constructor(url: string, ttl: number | undefined = undefined) {
    this.redisUrl = url
    this.ttl = ttl
  }
  private async ensureClient() {
    if (!this.client) {
      const redis = await import('redis')
      this.client = redis.createClient({ url: this.redisUrl })
    }
  }
  get(url: string) {
    return new Promise<string | undefined>(async (resolve, reject) => {
      try {
        await this.ensureClient()
        this.client!.get(url, (err, data) => {
          if (err) {
            reject(err)
          } else {
            resolve(data || undefined)
          }
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  async set(url: string, content: string) {
    await this.ensureClient()
    if (this.ttl !== undefined) {
      this.client!.set(url, content, 'EX', this.ttl)
    } else {
      this.client!.set(url, content)
    }
    return Promise.resolve()
  }
}
