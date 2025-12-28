import { encodeBase64, decodeBase64 } from 'tweetnacl-util'

const STORAGE_KEY = 'clientKeyPair'

export const getKey = () => {
  const storedKeys = localStorage.getItem(STORAGE_KEY)
  if (storedKeys) {
    try {
      const { publicKey, secretKey } = JSON.parse(storedKeys)
      return {
        publicKey: decodeBase64(publicKey),
        secretKey: decodeBase64(secretKey)
      }
    } catch (e) {
      console.error('Failed to parse stored client keys.', e)
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
  }
  return null
}

export const setKey = (keyPair) => {
  const toStore = {
    publicKey: encodeBase64(keyPair.publicKey),
    secretKey: encodeBase64(keyPair.secretKey)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
}
