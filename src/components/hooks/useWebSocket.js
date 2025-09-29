import PropTypes from 'prop-types'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import React, { createContext, useContext, useEffect, useMemo, useCallback, memo } from 'react'
import { useTunnelContext } from './useTunnel'
import { getEncryptedMessage, getDecryptedMessage, newNonce } from '../utils/encryptionWrapper'
const { CONNECTING, OPEN, CLOSING, CLOSED, UNINSTANTIATED } = ReadyState

const getConnectionMessage = (state, url, skip) => {
  if (skip) return 'Awaiting box key...'
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

/**
 * @returns {{readyState: ReadyState, lastJsonMessage, sendJsonMessage}}
 */
const useWebSocketContext = () => useContext(WebSocketContext)
const WebSocketProvider = memo(function WebSocketProvider ({ children, url, secretOrSharedKey, queryParams }) {
  const skip = !secretOrSharedKey
  const { readyState, sendMessage, lastMessage } = useWebSocket(url, { queryParams }, !skip)
  const { status } = useTunnelContext()

  const lastJsonMessage = useMemo(() => {
    if (!lastMessage) return null
    return getDecryptedMessage(secretOrSharedKey, lastMessage.data)
  }, [lastMessage, secretOrSharedKey])

  const sendJsonMessage = useCallback(message => {
    return sendMessage(getEncryptedMessage(secretOrSharedKey, message, newNonce()))
  }, [secretOrSharedKey, sendMessage])

  useEffect(() => {
    return () => {
      if (readyState === ReadyState.OPEN) {
        sendJsonMessage('close')
      }
    }
  }, [readyState, sendJsonMessage])

  return (
    <>
      {<status.In>{getConnectionMessage(readyState, url, skip)}</status.In>}
      <Provider value={{
        readyState,
        lastJsonMessage,
        sendJsonMessage
      }}>
        {children}
      </Provider>
    </>
  )
})

WebSocketProvider.propTypes = {
  children: PropTypes.any,
  secretOrSharedKey: PropTypes.instanceOf(Uint8Array),
  url: PropTypes.string,
  queryParams: PropTypes.object
}

export { useWebSocketContext, WebSocketProvider, ReadyState }
