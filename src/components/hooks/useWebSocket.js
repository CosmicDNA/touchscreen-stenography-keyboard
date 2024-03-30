import PropTypes from 'prop-types'
import React, { createContext, useContext, useEffect, useMemo } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import { useTunnelContext } from './useTunnel'
import { encryptionProcess, getEncryptedMessage, getDecryptedMessage } from '../utils/encryptionWrapper'
const { CONNECTING, OPEN, CLOSING, CLOSED, UNINSTANTIATED } = ReadyState

const getConnectionMessage = (state, url) => {
  switch (state) {
    case CONNECTING:
      return `Connecting to websocket ${url}...`
    case OPEN:
      return `Websocket connection to ${url} successfully opened!`
    case CLOSING:
      return `Closing websocket connection to ${url}...`
    case CLOSED:
      return `Websocket connection to ${url} is closed!`
    case UNINSTANTIATED:
      return `Websocket connection to ${url} is uninstantiated!`
  }
}
const WebSocketContext = createContext()
const { Provider } = WebSocketContext

const nonce = new Uint8Array([238, 249, 116, 23, 191, 120, 190, 185, 255, 98, 41, 13, 85, 255, 217, 51, 181, 121, 79, 19, 67, 152, 183, 64])
const middlewareAuthenticationRequest = 'MAR' // It could be any message, really as long it is properly encrypted.

/**
 * @returns {{readyState: ReadyState, lastJsonMessage, sendJsonMessage}}
 */
const useWebSocketContext = () => useContext(WebSocketContext)
const WebSocketProvider = ({ children, url, secretOrSharedKey }) => {
  // Here we use a constant nonce for the connection to avoid re renders.
  const queryParams = useMemo(
    () => {
      if (!secretOrSharedKey) return null
      return encryptionProcess(secretOrSharedKey, middlewareAuthenticationRequest, nonce)
    }, [secretOrSharedKey, middlewareAuthenticationRequest, nonce]
  )
  const { readyState, sendMessage, lastMessage } = useWebSocket(url, { queryParams }, !!secretOrSharedKey)
  const { status } = useTunnelContext()

  const lastJsonMessage = useMemo(() => {
    if (!lastMessage) return null
    return getDecryptedMessage(secretOrSharedKey, lastMessage.data)
  }, [lastMessage])

  const sendJsonMessage = message => {
    return sendMessage(getEncryptedMessage(secretOrSharedKey, message))
  }

  useEffect(() => {
    return () => {
      if (readyState === ReadyState.OPEN) {
        sendJsonMessage('close')
      }
    }
  }, [readyState])

  return (
    <>
      {<status.In>{getConnectionMessage(readyState, url)}</status.In>}
      <Provider value={{
        readyState,
        lastJsonMessage,
        sendJsonMessage
      }}>
        {children}
      </Provider>
    </>
  )
}

WebSocketProvider.propTypes = {
  children: PropTypes.any,
  secretOrSharedKey: PropTypes.instanceOf(Uint8Array),
  url: PropTypes.string
}

export { useWebSocketContext, WebSocketProvider, ReadyState }
