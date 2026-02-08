import PropTypes from 'prop-types'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import React, { createContext, useContext, useEffect, useMemo, useCallback, memo, useState, useRef } from 'react'
import { useTunnelContext } from './useTunnel'
import { getEncryptedMessage, getDecryptedMessage, newNonce, getBox } from '../utils/encryptionWrapper'
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
  <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'lightblue' }}>
    {url}
  </a>
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

const getTimestampedConnectionMessage = (state, url, skip, closeEvent) => {
  /**
  *
  * @param {ReadyState} state
  * @param {String} url
  * @param {Boolean} skip
  * @param {CloseEvent} closeEvent
  * @returns {{message: String | React.ReactNode, type: import('react-toastify').TypeOptions}} */
  const getConnectionMessage = (state, url, skip, closeEvent) => {
    const urlElement = <Url url={url} />

    switch (state) {
      case CONNECTING: {
        return { message: <>Connecting to websocket {urlElement}...</>, type: 'info' }
      } case OPEN: {
        if (skip) return { message: 'Awaiting box key...', type: 'info' }
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

  const { message, type } = getConnectionMessage(state, url, skip, closeEvent)

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
 * @param {Object} props.queryParams
 */
const RawWebSocketProvider = ({ children, url, queryParams }) => {
  // eslint-disable-next-line no-unused-vars
  const [closeEvent, setCloseEvent] = useState(null)
  const [pcPublicKey, setPcPublicKey] = useState(null)
  const secretOrSharedKey = useMemo(() => (pcPublicKey ? getBox(pcPublicKey) : null), [pcPublicKey])
  const skip = !url // Only skip if there is no URL.

  useEffect(() => {
    console.debug('WebSocketProvider URL or queryParams changed:', { url, queryParams })
  }, [queryParams, url])

  const { readyState, sendMessage, lastMessage } = useWebSocket(url, {
    queryParams,
    heartbeat: {
      message: JSON.stringify({ type: 'ping' }),
      interval: 30000,
      returnMessage: JSON.stringify({ type: 'pong' })
    },
    // onMessage: (event) => {
    //   if (event.data === 'pong') {
    //     console.log('Heartbeat pong received!')
    //   }
    // },
    shouldReconnect: (closeEvent) => {
      console.log('WebSocket closed:', closeEvent)
      setCloseEvent(closeEvent)
      return false
    }
  }, !skip)
  const { status } = useTunnelContext()

  const unencryptedMessage = useMemo(() => {
    if (!lastMessage?.data) return null
    try {
      return JSON.parse(lastMessage.data)
    } catch (e) {
      return null
    }
  }, [lastMessage])

  const lastJsonMessage = useMemo(() => {
    if (!unencryptedMessage) return null
    if (secretOrSharedKey) {
      try {
        return getDecryptedMessage(secretOrSharedKey, unencryptedMessage.payload)
      } catch (e) {
        // Fallback to plaintext parsing
      }
    }
    return unencryptedMessage
  }, [unencryptedMessage, secretOrSharedKey])

  // {"to":{"type":"pc"},"payload":{"stroke":"KAT"}}
  const sendJsonMessage = useCallback(payload => {
    if (secretOrSharedKey) {
      console.debug('There is a secret or shared key, encrypting message before sending. Original payload:', payload)
      const message = {
        to: { type: 'pc' },
        payload: getEncryptedMessage(secretOrSharedKey, payload, newNonce())
      }
      payload = message
    } else {
      console.debug('There is NOT a secret or shared key, sending raw message. Original payload:', payload)
    }
    return sendMessage(JSON.stringify(payload))
  }, [secretOrSharedKey, sendMessage])

  useEffect(() => {
    if (lastJsonMessage) {
      console.debug('Received WebSocket message:', lastJsonMessage)
      const from = lastJsonMessage?.from
      const payload = lastJsonMessage?.payload
      if (from?.type === 'pc' && from?.id === 0 && payload?.message === 'Here is my the public key for you to privately communicate with me...') {
        setPcPublicKey(payload?.public_key)
      }
    }
  }, [lastJsonMessage, secretOrSharedKey])

  useEffect(() => {
    // Effect for showing toast notifications on state change
    const isAwaitingKey = !secretOrSharedKey
    const { message, type } = getTimestampedConnectionMessage(readyState, url, isAwaitingKey, closeEvent)
    toast(message, { type })
  }, [readyState, url, secretOrSharedKey, closeEvent])

  const sendJsonMessageRef = useRef(sendJsonMessage)
  const readyStateRef = useRef(readyState)

  useEffect(() => {
    sendJsonMessageRef.current = sendJsonMessage
    readyStateRef.current = readyState
  }, [sendJsonMessage, readyState])

  useEffect(() => {
    // Effect for cleaning up the connection
    return () => {
      if (readyStateRef.current === ReadyState.OPEN) {
        sendJsonMessageRef.current('close')
      }
    }
  }, [url])

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
        sendJsonMessage,
        secretOrSharedKey
      }}>
        {children}
      </Provider>
    </>
  )
}

const WebSocketProvider = memo(RawWebSocketProvider)

RawWebSocketProvider.propTypes = {
  children: PropTypes.any,
  url: PropTypes.string,
  queryParams: PropTypes.object
}

export { useWebSocketContext, WebSocketProvider, ReadyState }
