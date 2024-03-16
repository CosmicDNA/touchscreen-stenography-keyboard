import { box, randomBytes } from 'tweetnacl'
import {
  decodeUTF8,
  encodeUTF8,
  encodeBase64,
  decodeBase64
} from 'tweetnacl-util'
import { Buffer } from 'buffer'

/**
 *
 * @returns {Uint8Array}
 */
const newNonce = () => randomBytes(box.nonceLength)

/**
 *
 * @returns {nacl.BoxKeyPair}
 */
const generateKeyPair = () => box.keyPair()

/**
 * Encrypts data using a secret or shared key and json object.
 *
 * @param {{
*   secretOrSharedKey: Uint8Array,
*   json: object,
*   key?: Uint8Array,
*   nonce?: Uint8Array
* }} params - The encryption parameters.
* @returns {Uint8Array} - The encrypted data.
*/
const encrypt = ({
  secretOrSharedKey,
  json,
  key = undefined,
  nonce = undefined
}) => {
  if (!nonce) nonce = newNonce()
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

/**
 *
 * @param {String} hexEncodedString
 * @returns {Uint8Array}
 */
const hexDecode = (hexEncodedString) => Uint8Array.from(Buffer.from(hexEncodedString, 'hex'))

export { generateKeyPair, encrypt, decrypt, box, hexEncode, hexDecode, newNonce }
