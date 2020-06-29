import type { ParsedPage } from './types'

import Mercury from '@postlight/mercury-parser'

export function parsePageUsingMercury(url: string): Promise<ParsedPage> {
  return Mercury.parse(url).then((result: { [x: string]: any }) => {
    return {
      content: result['content'],
    }
  })
}
