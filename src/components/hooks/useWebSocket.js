import PropTypes from 'prop-types'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import React, { createContext, useContext, useEffect, useMemo, useCallback, memo, useState } from 'react'
import { useTunnelContext } from './useTunnel'
import { getEncryptedMessage, getDecryptedMessage, newNonce } from '../utils/encryptionWrapper'
import ColoredCircle from '../ColoredCircle'
import { toast } from 'react-toastify'

const { CONNECTING, OPEN, CLOSING, CLOSED, UNINSTANTIATED } = ReadyState

const readyStateToColor = (state) => {
  if (state === OPEN) return 'lime'
  if (state === CONNECTING) return 'yellow'
  if (state === CLOSING) return 'orange'
  return 'red' // CLOSED or UNINSTANTIATED
}

/**
 *
 * @param {ReadyState} state
 * @param {String} url
 * @param {Boolean} skip
 * @param {CloseEvent} closeEvent
 * @param {import('@reduxjs/toolkit/query').FetchBaseQueryError | import('@reduxjs/toolkit').SerializedError | undefined} httpError
 * @returns {{message: String, type: import('react-toastify').TypeOptions}} */
const getConnectionMessage = (state, url, skip, closeEvent, httpError) => {
  const timestamp = new Date().toLocaleTimeString()
  const baseMessage = `[${timestamp}] `

  if (httpError) {
    const status = httpError.status ? `Status: ${httpError.status}\n` : ''
    const details = httpError.data?.error || httpError.error || 'An unknown error occurred while fetching the public key.'
    return { message: `${baseMessage}Error connecting to ${url}\n${status}Details: ${details}`, type: 'error' }
  }

  if (skip) return { message: `${baseMessage}Awaiting box key...`, type: 'info' }

  switch (state) {
    case CONNECTING: {
      return { message: `${baseMessage}Connecting to websocket ${url}...`, type: 'info' }
    } case OPEN: {
      return { message: `${baseMessage}Websocket connection to ${url} successfully opened!`, type: 'success' }
    } case CLOSING: {
      return { message: `${baseMessage}Closing websocket connection to ${url}...`, type: 'warning' }
    } case CLOSED: {
      const code = closeEvent?.code ? `\nCode: ${closeEvent.code}` : ''
      const reason = closeEvent?.reason ? `\nReason: ${closeEvent.reason}` : ''
      return { message: `${baseMessage}Websocket connection to ${url} is closed.${code}${reason}`, type: 'error' }
    } case UNINSTANTIATED: {
      return { message: `${baseMessage}Websocket connection to ${url} is uninstantiated.`, type: 'info' }
    }
  }
}

const WebSocketContext = createContext()
const { Provider } = WebSocketContext

/**
 * @returns {{readyState: ReadyState, lastJsonMessage, sendJsonMessage}}
 */
const useWebSocketContext = () => useContext(WebSocketContext)

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} props.url
 * @param {Uint8Array} props.secretOrSharedKey
 * @param {Object} props.queryParams
 * @param {Object} props.httpError
 */
const RawWebSocketProvider = ({ children, url, secretOrSharedKey, queryParams, httpError }) => {
  // eslint-disable-next-line no-unused-vars
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
    const { message, type } = getConnectionMessage(readyState, url, skip, closeEvent, httpError)
    toast(message, { type })
    return () => {
      if (readyState === ReadyState.OPEN) {
        sendJsonMessage('close')
      }
    }
  }, [closeEvent, httpError, readyState, sendJsonMessage, skip, url])

  return (
    <>
      {<status.In>
        <>
          <ColoredCircle
            color={readyStateToColor(readyState)}
            glow={readyState !== OPEN}
          />
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
}

const WebSocketProvider = memo(RawWebSocketProvider)

RawWebSocketProvider.propTypes = {
  children: PropTypes.any,
  secretOrSharedKey: PropTypes.instanceOf(Uint8Array),
  url: PropTypes.string,
  queryParams: PropTypes.object,
  httpError: PropTypes.object
}

export { useWebSocketContext, WebSocketProvider, ReadyState }
