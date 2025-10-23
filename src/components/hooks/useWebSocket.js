import PropTypes from 'prop-types'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import React, { createContext, useContext, useEffect, useMemo, useCallback, memo, useState } from 'react'
import { useTunnelContext } from './useTunnel'
import { getEncryptedMessage, getDecryptedMessage, newNonce } from '../utils/encryptionWrapper'
import ColoredCircle from '../ColoredCircle'
import { toast } from 'react-toastify'

const { CONNECTING, OPEN, CLOSING, CLOSED, UNINSTANTIATED } = ReadyState

const mappingReadyStateToColor = {
  [OPEN]: 'lime',
  [CONNECTING]: 'yellow',
  [CLOSING]: 'orange',
  [CLOSED]: 'red',
  [UNINSTANTIATED]: 'red'
}

const Url = ({ url }) => (
  <span style={{ color: 'lightBlue', textDecoration: 'underline' }}>
    {url}
  </span>
)
Url.propTypes = {
  url: PropTypes.string
}

const Timestamp = ({ time }) => (
  <span style={{ color: 'blue' }}>
    {`[${time}] `}
  </span>
)
Timestamp.propTypes = {
  time: PropTypes.string
}

const Timestamped = ({ timestamp, children }) => {
  return (
    <span style={{ whiteSpace: 'pre-wrap' }}>
      <Timestamp time={timestamp} />
      {children}
    </span>
  )
}

Timestamped.propTypes = {
  children: PropTypes.any,
  timestamp: PropTypes.any
}

const Details = ({ children }) => {
  return (
    <span style={{ color: 'lightGray' }}>
      {children}
    </span>
  )
}

Details.propTypes = {
  children: PropTypes.any
}

const getTimestampedConnectionMessage = (state, url, skip, closeEvent, httpError) => {
  /**
  *
  * @param {ReadyState} state
  * @param {String} url
  * @param {Boolean} skip
  * @param {CloseEvent} closeEvent
  * @param {import('@reduxjs/toolkit/query').FetchBaseQueryError | import('@reduxjs/toolkit').SerializedError | undefined} httpError
  * @returns {{message: String | React.ReactNode, type: import('react-toastify').TypeOptions}} */
  const getConnectionMessage = (state, url, skip, closeEvent, httpError) => {
    if (skip) return { message: 'Awaiting box key...', type: 'info' }

    const urlElement = <Url url={url} />

    if (httpError) {
      const status = httpError.status ? `Status: ${httpError.status}\n` : ''
      const details = httpError.data?.error || httpError.error || 'An unknown error occurred while fetching the public key.'
      return { message: <>Error connecting to {urlElement}.{'\n'}<Details>{status}Details: {details}</Details></>, type: 'error' }
    }

    switch (state) {
      case CONNECTING: {
        return { message: <>Connecting to websocket {urlElement}...</>, type: 'info' }
      } case OPEN: {
        return { message: <>Websocket connection to {urlElement} successfully opened!</>, type: 'success' }
      } case CLOSING: {
        return { message: <>Closing websocket connection to {urlElement}...</>, type: 'warning' }
      } case CLOSED: {
        const code = closeEvent?.code ? `\nCode: ${closeEvent.code}` : ''
        const reason = closeEvent?.reason ? `\nReason: ${closeEvent.reason}` : ''
        return { message: <>Websocket connection to {urlElement} is closed.{'\n'}<Details>{code}{reason}</Details></>, type: 'error' }
      } case UNINSTANTIATED: {
        return { message: <>Websocket connection to {urlElement} is uninstantiated.</>, type: 'info' }
      }
    }
  }

  const { message, type } = getConnectionMessage(state, url, skip, closeEvent, httpError)

  return {
    message: <Timestamped timestamp={new Date().toLocaleTimeString()}>{message}</Timestamped>,
    type
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
    // Effect for showing toast notifications on state change
    const { message, type } = getTimestampedConnectionMessage(readyState, url, skip, closeEvent, httpError)
    toast(message, { type })
  }, [readyState, url, skip, closeEvent, httpError])

  useEffect(() => {
    // Effect for cleaning up the connection
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
          <ColoredCircle
            color={mappingReadyStateToColor[readyState]}
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
