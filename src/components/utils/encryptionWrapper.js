import { encrypt, box, generateKeyPair, hexEncode, hexDecode, newNonce } from './encryption'

const pairA = generateKeyPair()

/**
 *
 * @param {String} publicKey
 * @param {*} object
 * @param {Uint8Array} nonce
 * @returns {{publicKey: String, encryptedMessage: String}}
 */
const encryptionProcess = (publicKey, json, nonce = undefined) => {
  console.log('Computing')
  const decodedPublicKey = hexDecode(publicKey)
  const secretOrSharedKey = box.before(decodedPublicKey, pairA.secretKey)
  const encryptedMessage = encrypt({ secretOrSharedKey, json, nonce })
  hexEncode(pairA.publicKey)
  return {
    publicKey: hexEncode(pairA.publicKey),
    encryptedMessage
  }
}

export { encryptionProcess, newNonce }
