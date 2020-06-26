import { newKey, sign, verify } from './sign'

test('newKey', () => {
  expect(newKey()).toBeTruthy()
})

test('sign and verify', () => {
  const key = newKey()
  const input = 'test'
  const signed = sign(input, key)
  expect(verify(input, signed, [])).toBeFalsy()
  expect(verify(input, signed, [newKey()])).toBeFalsy()
  expect(verify(input, signed, [newKey(), key])).toBeTruthy()
})
