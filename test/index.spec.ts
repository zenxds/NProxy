import {
  SOCKS_VERSION
} from '../src/socks5'

test('SOCKS_VERSION', () => {
  expect(SOCKS_VERSION).toEqual(5)
})
