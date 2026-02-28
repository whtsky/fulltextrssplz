import type { Cache } from './type'
import type { createClient } from 'redis'

export class RedisCache implements Cache {
  redisUrl: string
  client?: ReturnType<typeof createClient>
  ttl: number | undefined
  constructor(url: string, ttl: number | undefined = undefined) {
    this.redisUrl = url
    this.ttl = ttl
  }
  private async ensureClient() {
    if (!this.client) {
      const redis = await import('redis')
      this.client = redis.createClient({ url: this.redisUrl })
      await this.client.connect()
    }
  }
  async get(url: string): Promise<string | undefined> {
    await this.ensureClient()
    const data = await this.client!.get(url)
    return data || undefined
  }

  async set(url: string, content: string) {
    await this.ensureClient()
    if (this.ttl !== undefined) {
      await this.client!.set(url, content, { EX: this.ttl })
    } else {
      await this.client!.set(url, content)
    }
  }
}
