import React, { createContext, useContext } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import PropTypes from 'prop-types'
import { useTunnelContext } from './useTunnel'

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

  getConnectionMessage (url) {
    switch (this.readyState) {
      case ReadyState.CONNECTING:
        return `Connecting to websocket ${url}...`
      case ReadyState.OPEN:
        return `Websocket connection to ${url} successfully opened!`
      case ReadyState.CLOSING:
        return `Closing websocket connection to ${url}...`
      case ReadyState.UNINSTANTIATED:
        return `Websocket connection to ${url} is uninstantiated!`
    }
  }
}

const WebSocketContext = createContext()

const useWebSocketContext = () => useContext(WebSocketContext)

const WebSocketProvider = ({ children, url, secretkey }) => {
  const { readyState, lastJsonMessage, sendMessage, sendJsonMessage } = useWebSocket(url)
  const newReadyState = new CustomReadyState(readyState)
  const { status } = useTunnelContext()

  return (
    <>
      {<status.In>{newReadyState.getConnectionMessage(url)}</status.In>}
      <WebSocketContext.Provider value={{
        readyState: newReadyState,
        lastJsonMessage,
        sendMessage,
        sendJsonMessage,
        secretkey
      }}>
        {children}
      </WebSocketContext.Provider>
    </>
  )
}

WebSocketProvider.propTypes = {
  children: PropTypes.any,
  secretkey: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired
}

export { useWebSocketContext, WebSocketProvider }
