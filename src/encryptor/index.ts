import { Encryptor } from '../type'

import * as cfb from './cfb'
import * as encryptor1 from './encryptor1'

interface EncryptorMap {
  [prop: string]: Encryptor
}

const encryptors: EncryptorMap = {
  '1': cfb,
  '2': encryptor1
}

export default encryptors
