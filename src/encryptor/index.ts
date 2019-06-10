import { Encryptor } from '../type'

import * as cfb from './cfb'

interface EncryptorMap {
  [prop: string]: Encryptor
}

const encryptors: EncryptorMap = {
  '1': cfb
}

export default encryptors
