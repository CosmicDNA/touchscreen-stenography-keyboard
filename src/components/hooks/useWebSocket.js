import PropTypes from 'prop-types'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import React, { createContext, useContext, useEffect, useMemo, useCallback, memo, useState } from 'react'
import { useTunnelContext } from './useTunnel'
import { getEncryptedMessage, getDecryptedMessage, newNonce } from '../utils/encryptionWrapper'
import ColoredCircle from '../ColoredCircle'
const { CONNECTING, OPEN, CLOSING, CLOSED, UNINSTANTIATED } = ReadyState

const readyStateToColor = (state) => {
  if (state === OPEN) return 'green'
  if (state === CONNECTING) return 'yellow'
  if (state === CLOSING) return 'orange'
  return 'red' // CLOSED or UNINSTANTIATED
}
const getConnectionMessage = (state, url, skip, closeEvent) => {
  if (skip) return 'Awaiting box key...'
  switch (state) {
    case CONNECTING: {
      return `Connecting to websocket ${url}...`
    } case OPEN: {
      return `Websocket connection to ${url} successfully opened!`
    } case CLOSING: {
      return `Closing websocket connection to ${url}...`
    } case CLOSED: {
      const reason = closeEvent?.reason ? ` Reason: ${closeEvent.reason}` : ''
      const code = closeEvent?.code ? ` (Code: ${closeEvent.code})` : ''
      return `Websocket connection to ${url} is closed!${code}${reason}`
    } case UNINSTANTIATED: {
      return `Websocket connection to ${url} is uninstantiated!`
    }
  }
}
const getAndLogConnectionMessage = (state, url, skip, closeEvent) => {
  const message = getConnectionMessage(state, url, skip, closeEvent)
  console.log(message)
  return message
}
const WebSocketContext = createContext()
const { Provider } = WebSocketContext

/**
 * @returns {{readyState: ReadyState, lastJsonMessage, sendJsonMessage}}
 */
const useWebSocketContext = () => useContext(WebSocketContext)
const WebSocketProvider = memo(function WebSocketProvider ({ children, url, secretOrSharedKey, queryParams }) {
  const [closeEvent, setCloseEvent] = useState(null)
  const skip = !secretOrSharedKey
  const { readyState, sendMessage, lastMessage } = useWebSocket(url, {
    queryParams,
    heartbeat: {
      message: 'ping',
      interval: 30000,
      returnMessage: 'pong'
    },
    onMessage: (event) => {
      if (event.data === 'pong') {
        console.log('Heartbeat pong received!')
      }
    },
    shouldReconnect: (closeEvent) => {
      console.log('WebSocket closed:', closeEvent)
      setCloseEvent(closeEvent)
      return false
    }
  }, !skip)
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
      {<status.In>
        <>
          <ColoredCircle color={readyStateToColor(readyState)} />
          {getAndLogConnectionMessage(readyState, url, skip, closeEvent)}
        </>
      </status.In>}
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
