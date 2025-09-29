import { useMemo } from 'react'
import { getBox, encryptionProcess } from '../utils/encryptionWrapper'

const NONCE = new Uint8Array([238, 249, 116, 23, 191, 120, 190, 185, 255, 98, 41, 13, 85, 255, 217, 51, 181, 121, 79, 19, 67, 152, 183, 64])
const MIDDLEWARE_AUTHENTICATION_REQUEST = 'MAR'

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
    return encryptionProcess(secretOrSharedKey, MIDDLEWARE_AUTHENTICATION_REQUEST, NONCE)
  }, [secretOrSharedKey])

  return { secretOrSharedKey, queryParams }
}

export default useWebSocketAuth
