import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import StenoKeyboard from './components/StenoKeyboard'
import { WebSocketProvider } from './components/hooks/useWebSocket'
import { useControls } from 'leva'
import { TunnelProvider, useTunnelContext } from './components/hooks/useTunnel'

const protocols = {
  ws: 'ws://',
  wss: 'wss://'
}

const sendStroke = {
  onKeyPress: 'onKeyPress',
  onKeyRelease: 'onKeyRelease'
}

const protocolOptions = Object.keys(protocols)

const Tunneled = ({ ...props }) => {
  const { status } = useTunnelContext()
  const options = {
    protocol: { value: protocols.ws, options: protocolOptions },
    host: { value: 'localhost' },
    port: { value: 8086, min: 1024, max: 49151, step: 1 },
    path: { value: '/websocket' },
    secret: { value: 'mysecretkey' }
  }
  const wsControls = useControls('Plover Web-socket Plugin', options)
  const kControls = useControls('Keyboard', { sendStroke: { value: sendStroke.onKeyRelease, options: Object.keys(sendStroke) } })
  return (
    <>
      <header>
        <status.Out />
      </header>
      <Canvas camera={{ position: [0, 6, 10], fov: 25 }}>
        {/* eslint-disable-next-line react/no-unknown-property */}
        <ambientLight intensity={0.5} />
        {/* eslint-disable-next-line react/no-unknown-property */}
        <directionalLight position={[10, 10, 5]} />
        {/* <Suspense fallback={<status.In>Loading ...</status.In>}> */}
        <WebSocketProvider
          url={`${wsControls.protocol}${wsControls.host}:${wsControls.port}${wsControls.path}`}
          secretkey={wsControls.secret}
        >
          <StenoKeyboard controls={kControls}/>
        </WebSocketProvider>
        {/* </Suspense> */}
        <ContactShadows frames={1} position-y={-0.5} blur={1} opacity={0.75} />
        {/* <ContactShadows frames={1} position-y={-0.5} blur={3} color="orange" /> */}
        <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} touches={false} />
      </Canvas>
    </>
  )
}

const App = () => {
  return (
    <TunnelProvider>
      <Tunneled />
    </TunnelProvider>
  )
}

export default App
