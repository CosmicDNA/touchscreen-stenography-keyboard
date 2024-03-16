import { encrypt, box, generateKeyPair, hexEncode, hexDecode } from './encryption'

const pairA = generateKeyPair()

/**
 *
 * @param {String} publicKey
 * @param {*} object
 * @returns {publicKey: String, encryptedMessage: String}
 */
const encryptionProcess = (publicKey, object) => {
  const decodedPublicKey = hexDecode(publicKey)
  const sharedA = box.before(decodedPublicKey, pairA.secretKey)
  const encryptedMessage = encrypt(sharedA, object)
  hexEncode(pairA.publicKey)
  return {
    publicKey: hexEncode(pairA.publicKey),
    encryptedMessage
  }
}

export { encryptionProcess }
