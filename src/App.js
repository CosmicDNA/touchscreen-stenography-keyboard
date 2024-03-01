import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import StenoKeyboard from './components/StenoKeyboard'
import { WebSocketProvider } from './components/hooks/useWebSocket'

const App = () => {
  return (
    <WebSocketProvider url={'ws://localhost:8086/websocket'} secretkey={'mysecretkey'}>
      <Canvas camera={{ position: [0, 6, 10], fov: 25 }}>
        {/* eslint-disable-next-line react/no-unknown-property */}
        <ambientLight intensity={0.5} />
        {/* eslint-disable-next-line react/no-unknown-property */}
        <directionalLight position={[10, 10, 5]} />
        <StenoKeyboard />
        <ContactShadows frames={1} position-y={-0.5} blur={1} opacity={0.75} />
        {/* <ContactShadows frames={1} position-y={-0.5} blur={3} color="orange" /> */}
        <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} touches={false} />
      </Canvas>
    </WebSocketProvider>
  )
}

export default App
