import React, { createContext, useContext } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import PropTypes from 'prop-types'

class CustomReadyState {
  constructor (readyState) {
    this.readyState = readyState
    this.possibleStatus = ReadyState
  }

  state () {
    return this.readyState
  }

  status () {
    return {
      [ReadyState.CONNECTING]: 'Connecting',
      [ReadyState.OPEN]: 'Open',
      [ReadyState.CLOSING]: 'Closing',
      [ReadyState.CLOSED]: 'Closed',
      [ReadyState.UNINSTANTIATED]: 'Uninstantiated'
    }[this.readyState]
  }
}

const WebSocketContext = createContext()

const useWebSocketContext = () => useContext(WebSocketContext)

const WebSocketProvider = ({ children, url, secretkey }) => {
  const { readyState, lastJsonMessage, sendMessage, sendJsonMessage } = useWebSocket(url)
  const newReadyState = new CustomReadyState(readyState)

  if (readyState !== ReadyState.OPEN) return `Connecting to websocket ${url}...`

  return (
    <WebSocketContext.Provider value={{
      readyState: newReadyState,
      lastJsonMessage,
      sendMessage,
      sendJsonMessage,
      secretkey
    }}>
      {children}
    </WebSocketContext.Provider>
  )
}

WebSocketProvider.propTypes = {
  children: PropTypes.any,
  secretkey: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired
}

export { useWebSocketContext, WebSocketProvider }
