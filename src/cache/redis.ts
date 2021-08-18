import type { Cache } from './type'
import redis from "redis"


export class RedisCache implements Cache {
  client: redis.RedisClient;
  ttl: number|undefined;
  constructor(url: string, ttl: number | undefined = undefined) {
    this.client = redis.createClient({ url });
    this.ttl = ttl
  }
  get(url: string) {
    return new Promise<string | undefined>((resolve, reject) => {
      this.client.get(url, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data || undefined)
        }
    })
  })
}

  set(url: string, content: string): Promise<void> {
    if (this.ttl !== undefined) {
      this.client.set(url, content, 'EX', this.ttl)
    } else {
      this.client.set(url, content)
    }
    return Promise.resolve()
  }
}
