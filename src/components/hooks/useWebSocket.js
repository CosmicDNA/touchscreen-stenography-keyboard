// import PropTypes from 'prop-types'
// import React, { createContext, useContext, useEffect, useState } from 'react'
// import { io } from 'socket.io-client' // Import Socket.IO
// import { useTunnelContext } from './useTunnel'

// const WebSocketContext = createContext()
// const { Provider } = WebSocketContext

// const useWebSocketContext = () => useContext(WebSocketContext)

// /**
//  *
//  * @param {(import 'socket.io-client').Socket} socket
//  * @returns
//  */
// const getSocket = socket => socket

// const WebSocketProvider = ({ children, url, secretkey }) => {
//   const [rawSocket, setSocket] = useState(null) // Socket.IO instance
//   const theSocket = getSocket(rawSocket)
//   const [lastJsonMessage, setLastJsonMessage] = useState(null)

//   const sendMessage = (data) => theSocket.send(data)
//   const sendJsonMessage = (data) => sendMessage(JSON.stringify(data))

//   const onConnect = () => {
//     console.log('Socket connected!')
//   }

//   const onDisconnect = () => {
//     console.log('Socket disconnected!')
//   }

//   const onMessage = (message) => {
//     console.log(message)
//     try {
//       const parsed = JSON.parse(message)
//       setLastJsonMessage(parsed)
//     } catch (e) {
//       console.log(JSON.stringify(e))
//     }
//   }

//   useEffect(() => {
//     // Create a persistent Socket.IO connection
//     console.log(url)
//     const socket = io(url, {
//       extraHeaders: {
//         Authorization: `Token ${secretkey}` // Add your authorization token here
//       },
//       path: '/websocket',
//       transports: ['websocket'],
//       query: {}
//     })
//     console.log(socket)

//     // const socket = io(url)

//     // Attach event listeners (customize as needed)
//     socket.on('connect', onConnect)
//     socket.on('disconnect', onDisconnect)
//     socket.on('message', onMessage)

//     // Save the socket instance
//     setSocket(socket)

//     // Clean up on unmount
//     return () => {
//       socket.disconnect()
//     }
//   }, [url, secretkey])

//   const { status } = useTunnelContext()

//   return (
//     <>
//       <status.In>Connecting to websocket {url}...</status.In>
//       <Provider value={{
//         theSocket,
//         sendJsonMessage,
//         sendMessage,
//         lastJsonMessage
//       }}>
//         {children}
//       </Provider>
//     </>
//   )
// }

// WebSocketProvider.propTypes = {
//   children: PropTypes.any,
//   secretkey: PropTypes.string,
//   url: PropTypes.string
// }

// export { WebSocketProvider, useWebSocketContext }

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
