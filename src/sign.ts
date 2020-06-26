import crypto from 'crypto'

const keyLength = 16
const algorithm = 'sha256'

export function newKey(): string {
  return crypto.randomBytes(keyLength).toString('hex')
}

export function sign(url: string, key: string) {
  const hmac = crypto.createHmac(algorithm, key)
  hmac.update(url)
  return hmac.digest('hex')
}

export function verify(url: string, hmac: string, keys: string[]): boolean {
  return !!keys.find((key) => sign(url, key) === hmac)
}
