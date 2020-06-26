import type { Cache } from './type'

export class DummyCache implements Cache {
  get(url: string) {
    return Promise.resolve(undefined)
  }

  set(url: string, content: string): Promise<void> {
    return Promise.resolve()
  }
}
