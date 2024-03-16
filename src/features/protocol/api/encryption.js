import { box, randomBytes } from 'tweetnacl'
import {
  decodeUTF8,
  encodeUTF8,
  encodeBase64,
  decodeBase64
} from 'tweetnacl-util'

const newNonce = () => randomBytes(box.nonceLength)
const generateKeyPair = () => box.keyPair()

/**
 *
 * @param {Uint8Array} secretOrSharedKey
 * @param {*} json
 * @param {Uint8Array} key
 * @returns
 */
const encrypt = (
  secretOrSharedKey,
  json,
  key
) => {
  const nonce = newNonce()
  const messageUint8 = decodeUTF8(JSON.stringify(json))
  const encrypted = key
    ? box(messageUint8, nonce, key, secretOrSharedKey)
    : box.after(messageUint8, nonce, secretOrSharedKey)

  const fullMessage = new Uint8Array(nonce.length + encrypted.length)
  fullMessage.set(nonce)
  fullMessage.set(encrypted, nonce.length)

  const base64FullMessage = encodeBase64(fullMessage)
  return base64FullMessage
}

/**
 *
 * @param {Uint8Array} secretOrSharedKey
 * @param {String} messageWithNonce
 * @param {Uint8Array} key
 * @returns {*}
 */
const decrypt = (
  secretOrSharedKey,
  messageWithNonce,
  key
) => {
  const messageWithNonceAsUint8Array = decodeBase64(messageWithNonce)
  const nonce = messageWithNonceAsUint8Array.slice(0, box.nonceLength)
  const message = messageWithNonceAsUint8Array.slice(
    box.nonceLength,
    messageWithNonce.length
  )

  const decrypted = key
    ? box.open(message, nonce, key, secretOrSharedKey)
    : box.open.after(message, nonce, secretOrSharedKey)

  if (!decrypted) {
    throw new Error('Could not decrypt message')
  }

  const base64DecryptedMessage = encodeUTF8(decrypted)
  return JSON.parse(base64DecryptedMessage)
}

/**
 *
 * @param {Uint8Array} uint8Array
 * @returns {String}
 */
const hexEncode = (uint8Array) => Array.from(uint8Array)
  .map(byte => byte.toString(16).padStart(2, '0'))
  .join('')

export { generateKeyPair, encrypt, decrypt, box, hexEncode }
