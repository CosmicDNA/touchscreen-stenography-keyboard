import { urlSafeEncrypt, decrypt, box, generateKeyPair, hexEncode, hexDecode, newNonce, encrypt } from './encryption'
import { getKey, setKey } from './keyStorage'

let pairA = getKey()
if (!pairA) {
  pairA = generateKeyPair()
  setKey(pairA)
}

/**
 *
 * @param {Uint8Array} secretOrSharedKey
 * @param {*} json
 * @param {Uint8Array} nonce
 * @returns {{publicKey: String, encryptedMessage: String}}
 */
const encryptionProcess = (secretOrSharedKey, json, nonce = undefined) => {
  const encryptedMessage = urlSafeEncrypt({ secretOrSharedKey, json, nonce })
  const publicKey = hexEncode(pairA.publicKey)
  return {
    publicKey,
    encryptedMessage
  }
}

/**
 *
 * @param {*} secretOrSharedKey
 * @param {*} encryptedMessage
 * @returns
 */
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

const getClientPublicKeyHex = () => {
  return hexEncode(pairA.publicKey)
}

export { encryptionProcess, getDecryptedMessage, getBox, getEncryptedMessage, newNonce, getClientPublicKeyHex }
