export interface Cache {
  get(url: string): Promise<string | undefined>
  set(url: string, content: string): Promise<void>
}
