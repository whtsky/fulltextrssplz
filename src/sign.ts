import crypto from 'crypto'

import hmac from 'crypto-js/hmac-sha256'

const keyLength = 16

export function newKey(): string {
  return crypto.randomBytes(keyLength).toString('hex')
}

export function sign(url: string, key: string) {
  return hmac(url, key).toString()
}

export function verify(url: string, hmac: string, keys: string[]): boolean {
  return !!keys.find((key) => sign(url, key) === hmac)
}
