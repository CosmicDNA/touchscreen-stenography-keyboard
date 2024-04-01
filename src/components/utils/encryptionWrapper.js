import { encrypt, decrypt, box, generateKeyPair, hexEncode, hexDecode, newNonce } from './encryption'

const pairA = generateKeyPair()

/**
 *
 * @param {Uint8Array} secretOrSharedKey
 * @param {*} json
 * @param {Uint8Array} nonce
 * @returns {{publicKey: String, encryptedMessage: String}}
 */
const encryptionProcess = (secretOrSharedKey, json, nonce = undefined) => {
  const encryptedMessage = encrypt({ secretOrSharedKey, json, nonce })
  const publicKey = hexEncode(pairA.publicKey)
  return {
    publicKey,
    encryptedMessage
  }
}

const getDecryptedMessage = (secretOrSharedKey, encryptedMessage) => {
  return decrypt(secretOrSharedKey, encryptedMessage, null)
}

/**
 *
 * @param {Uint8Array} secretOrSharedKey
 * @param {*} message
 * @returns
 */
const getEncryptedMessage = (secretOrSharedKey, message) => {
  return encrypt({ secretOrSharedKey, json: message })
}

/**
 *
 * @param {*} publicKey
 * @returns {Uint8Array}
 */
const getBox = (publicKey) => {
  const decodedPublicKey = hexDecode(publicKey)
  return box.before(decodedPublicKey, pairA.secretKey)
}

export { encryptionProcess, getDecryptedMessage, getBox, getEncryptedMessage, newNonce }
