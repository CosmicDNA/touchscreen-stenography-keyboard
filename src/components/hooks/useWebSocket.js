import PropTypes from 'prop-types'
import React, { createContext, useContext } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import { useTunnelContext } from './useTunnel'
const { CONNECTING, OPEN, CLOSING, CLOSED, UNINSTANTIATED } = ReadyState
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
      [CONNECTING]: 'Connecting',
      [OPEN]: 'Open',
      [CLOSING]: 'Closing',
      [CLOSED]: 'Closed',
      [UNINSTANTIATED]: 'Uninstantiated'
    }[this.readyState]
  }

  getConnectionMessage (url) {
    switch (this.readyState) {
      case CONNECTING:
        return `Connecting to websocket ${url}...`
      case OPEN:
        return `Websocket connection to ${url} successfully opened!`
      case CLOSING:
        return `Closing websocket connection to ${url}...`
      case UNINSTANTIATED:
        return `Websocket connection to ${url} is uninstantiated!`
    }
  }
}
const WebSocketContext = createContext()
const { Provider } = WebSocketContext
const useWebSocketContext = () => useContext(WebSocketContext)
const WebSocketProvider = ({ children, url, secretkey }) => {
  const { readyState, lastJsonMessage, sendMessage, sendJsonMessage } = useWebSocket(url)
  const newReadyState = new CustomReadyState(readyState)
  const { status } = useTunnelContext()
  return (
    <>
      {<status.In>{newReadyState.getConnectionMessage(url)}</status.In>}
      <Provider value={{
        readyState: newReadyState,
        lastJsonMessage,
        sendMessage,
        sendJsonMessage
      }}>
        {children}
      </Provider>
    </>
  )
}

WebSocketProvider.propTypes = {
  children: PropTypes.any,
  secretkey: PropTypes.string,
  url: PropTypes.string
}
export { useWebSocketContext, WebSocketProvider }
