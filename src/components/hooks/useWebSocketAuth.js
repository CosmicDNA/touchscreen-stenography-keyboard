import { useMemo } from 'react'
import { getBox, encryptionProcess, newNonce } from '../utils/encryptionWrapper'

const MIDDLEWARE_AUTHENTICATION_REQUEST = 'MAR' // Message Authentication Request

/**
 * A hook to handle WebSocket authentication logic.
 * It computes the shared secret and generates the necessary query parameters
 * for the WebSocket connection handshake.
 * @param {string | undefined} publicKey - The public key from the server.
 * @returns {{secretOrSharedKey: Uint8Array | null, queryParams: object | null}}
 */
const useWebSocketAuth = (publicKey) => {
  const secretOrSharedKey = useMemo(
    () => {
      if (!publicKey) return null
      return getBox(publicKey)
    }, [publicKey]
  )

  const queryParams = useMemo(() => {
    if (!secretOrSharedKey) return null
    // A new nonce must be generated for every encryption.
    return encryptionProcess(secretOrSharedKey, MIDDLEWARE_AUTHENTICATION_REQUEST, newNonce())
  }, [secretOrSharedKey])

  return { secretOrSharedKey, queryParams }
}

export default useWebSocketAuth
