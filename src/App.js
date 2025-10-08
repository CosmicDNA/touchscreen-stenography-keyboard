import PropTypes from 'prop-types'
import React, { useState, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import StenoKeyboard from './components/StenoKeyboard'
import { WebSocketProvider } from './components/hooks/useWebSocket'
import { TunnelProvider, useTunnelContext } from './components/hooks/useTunnel.js'
import Grid from './components/Grid'
import { Vector3 } from 'three'
import { atomWithStorage } from 'jotai/utils'
import { useAtom } from 'jotai'
import { useGetPublicKeyQuery } from './features/protocol/api/apiSlice'
// import JSONPretty from 'react-json-pretty'
import 'react-json-pretty/themes/monikai.css'
import styles from './App.module.css' // This import is now used
import useTheme from './components/hooks/useTheme'
import useWebSocketAuth from './components/hooks/useWebSocketAuth'
import usePersistedControls from './components/hooks/use-persisted-controls.js'

/**
 *
 * @param {{scheduledCameraPositionSave: {scheduled: Boolean, setPersistentCameraPosition: func} setScheduledCameraPositionSave: func}} param0
 * @returns
 */
const ReactToCameraChange = ({ onCameraUpdate, children, trackCamera = true }) => {
  let previousCameraPosition = new Vector3()
  useFrame(({ camera }, clockDelta) => {
    if (trackCamera) {
      const position = camera.position
      const cameraPositionDelta = position.clone().sub(previousCameraPosition)
      const speed = cameraPositionDelta.clone().divideScalar(clockDelta)
      onCameraUpdate({ speed, position })
      previousCameraPosition = position.clone()
    }
  })

  return (
    <>
      {children}
    </>
  )
}
ReactToCameraChange.propTypes = {
  onCameraUpdate: PropTypes.func.isRequired,
  trackCamera: PropTypes.bool,
  children: PropTypes.any
}

const sendStroke = {
  onKeyPress: 'onKeyPress',
  onKeyRelease: 'onKeyRelease'
}

const wsSchema = {
  host: 'localhost:8086',
  TLS: false
}

const kSchema = {
  sendStroke: { value: sendStroke.onKeyRelease, options: Object.keys(sendStroke) },
  lockPosition: false,
  performanceMonitor: false,
  show3DText: true,
  showShadows: true
}

const initialCameraPosition = new Vector3(0, 6, 10)
const cameraAtom = atomWithStorage(
  'cameraPosition',
  initialCameraPosition,
  undefined,
  { getOnInit: true }
)

const Tunneled = () => {
  const { status } = useTunnelContext()
  const wsControls = usePersistedControls('Plover Web-socket Plugin', wsSchema)
  const kControls = usePersistedControls('Keyboard', kSchema)

  const isTLS = wsControls.TLS
  const urlPredicate = `://${wsControls.host}`
  const baseUrl = `${isTLS ? 'https' : 'http'}${urlPredicate}`
  const websocketUrl = useMemo(() => {
    // Only provide a URL if the host is set and we are not in a loading state
    // specific to the websocket controls.
    if (!wsControls.host) return null
    return `${isTLS ? 'wss' : 'ws'}${urlPredicate}/websocket`
  }, [wsControls.host, isTLS, urlPredicate])

  const theme = useTheme()

  useEffect(() => {
    document.body.style.backgroundColor = theme === 'dark' ? 'black' : '#f0f0f0'
  }, [theme])

  const publicKeyQuery = useGetPublicKeyQuery(baseUrl, { skip: !wsControls.host })
  const {
    data: publicKey,
    // eslint-disable-next-line no-unused-vars
    isError,
    // eslint-disable-next-line no-unused-vars
    error
  } = publicKeyQuery

  const { secretOrSharedKey, queryParams } = useWebSocketAuth(publicKey)

  const [persistentCameraPosition, setPersistentCameraPosition] = useAtom(cameraAtom)
  const [trackCamera, setTrackCamera] = useState(false)

  const onOrbitMotionEnd = (event) => {
    setTrackCamera(true)
  }

  const onCameraUpdate = ({ speed, position }) => {
    const speedModule = speed.length()
    if (speedModule < 1E-3) {
      // Pretty much stabilised
      setTrackCamera(false)
      setPersistentCameraPosition(position)
      // console.log('Saved to persistent storage camera position:', position)
    }
  }

  const { parent, child } = styles

  return (
    <div className={parent}>
      <div className={child}>
        <status.Out />
      </div>
        <Canvas camera={{ position: Object.values(persistentCameraPosition), fov: 25 }}>
          {kControls.performanceMonitor && <Perf position='bottom-right' />}
          <ReactToCameraChange {...{ onCameraUpdate, trackCamera } }>
            {/* eslint-disable-next-line react/no-unknown-property */}
            <ambientLight intensity={0.5} />
            {/* eslint-disable-next-line react/no-unknown-property */}
            <directionalLight position={[10, 10, 5]} />
            <WebSocketProvider
              url={websocketUrl}
              secretOrSharedKey={secretOrSharedKey}
              queryParams={queryParams}
              httpError={error}
            >
              <StenoKeyboard controls={kControls} />
            </WebSocketProvider>
            {kControls.showShadows && <ContactShadows frames={1} position-y={-0.5} blur={1} opacity={0.75} />}
            {/* <ContactShadows frames={1} position-y={-0.5} blur={3} color="orange" /> */}
            <OrbitControls
              onEnd={onOrbitMotionEnd}
              zoomSpeed={0.25}
              // The camera position is now persisted via the Jotai atom
              minPolarAngle={0}
              dampingFactor={0.05}
              enableDamping={true}
              maxPolarAngle={Math.PI / 2.1} // Prevents camera from going under the grid
              enableRotate={!kControls.lockPosition}
              enablePan={!kControls.lockPosition}
              enableZoom={!kControls.lockPosition}
            />
            <Grid position={[0, -0.5, 0]} />
          </ReactToCameraChange>
        </Canvas>
          {/* <status.In className='child'>
            {
                isError &&
                  <JSONPretty id="json-pretty" data={error}></JSONPretty>
            }
          </status.In> */}
    </div>
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
