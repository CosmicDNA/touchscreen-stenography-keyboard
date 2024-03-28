import PropTypes from 'prop-types'
import React, { createContext, useContext, useEffect, useMemo } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import { useTunnelContext } from './useTunnel'
import { encryptionProcess } from '../utils/encryptionWrapper'
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
      case CLOSED:
        return `Websocket connection to ${url} is closed!`
      case UNINSTANTIATED:
        return `Websocket connection to ${url} is uninstantiated!`
    }
  }
}
const WebSocketContext = createContext()
const { Provider } = WebSocketContext

const nonce = new Uint8Array([238, 249, 116, 23, 191, 120, 190, 185, 255, 98, 41, 13, 85, 255, 217, 51, 181, 121, 79, 19, 67, 152, 183, 64])
const middlewareAuthenticationRequest = 'MAR' // It could be any message, really as long it is properly encrypted.

const useWebSocketContext = () => useContext(WebSocketContext)
const WebSocketProvider = ({ children, url, publicKey }) => {
  // Here we use a constant nonce for the connection to avoid re renders.
  const queryParams = useMemo(
    () => {
      if (!publicKey) return null
      return encryptionProcess(publicKey, middlewareAuthenticationRequest, nonce)
    }, [publicKey, middlewareAuthenticationRequest, nonce]
  )
  const { readyState, lastJsonMessage, sendJsonMessage: rawSendJsonMessage } = useWebSocket(url, { queryParams })
  const newReadyState = new CustomReadyState(readyState)
  const { status } = useTunnelContext()

  const sendJsonMessage = message => {
    return rawSendJsonMessage(encryptionProcess(publicKey, message))
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
      {<status.In>{newReadyState.getConnectionMessage(url)}</status.In>}
      <Provider value={{
        readyState: newReadyState,
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
  publicKey: PropTypes.string,
  url: PropTypes.string
}

export { useWebSocketContext, WebSocketProvider }
