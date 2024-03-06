import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import StenoKeyboard from './components/StenoKeyboard'
import { WebSocketProvider } from './components/hooks/useWebSocket'
import { TunnelProvider, useTunnelContext } from './components/hooks/useTunnel'
import Grid from './components/Grid'
import useLevaControls, { getAtom } from './components/hooks/useLevaControls'

const protocols = {
  ws: 'ws://',
  wss: 'wss://'
}

const sendStroke = {
  onKeyPress: 'onKeyPress',
  onKeyRelease: 'onKeyRelease'
}

const websocketOptions = {
  protocol: { value: protocols.ws, options: Object.keys(protocols) },
  host: { value: 'localhost' },
  port: { value: 8086, min: 1024, max: 49151, step: 1 },
  path: { value: '/websocket' },
  secret: { value: 'mysecretkey' }
}
const keyboardOptions = {
  sendStroke: { value: sendStroke.onKeyRelease, options: Object.keys(sendStroke) }
}

const wsOptionsAtom = getAtom({ websocketOptions })
const kOptionsAtom = getAtom({ keyboardOptions })

const Tunneled = ({ ...props }) => {
  const { status } = useTunnelContext()
  const wsControls = useLevaControls({
    useControlsParams: ['Plover Web-socket Plugin', websocketOptions],
    atom: wsOptionsAtom
  })
  const kControls = useLevaControls({
    useControlsParams: ['Keyboard', keyboardOptions],
    atom: kOptionsAtom
  })

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
        <ContactShadows frames={3} position-y={-0.5} blur={1} opacity={0.75} />
        {/* <ContactShadows frames={1} position-y={-0.5} blur={3} color="orange" /> */}
        <OrbitControls
          autoRotate={false}
          autoRotateSpeed={-0.1}
          zoomSpeed={0.25}
          minPolarAngle={0}
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2.1}
        />
          <Grid position={[0, -0.5, 0]} />
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
