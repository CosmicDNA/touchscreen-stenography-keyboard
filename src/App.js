import PropTypes from 'prop-types'
import React, { useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import StenoKeyboard from './components/StenoKeyboard'
import { WebSocketProvider } from './components/hooks/useWebSocket'
import { TunnelProvider, useTunnelContext } from './components/hooks/useTunnel'
import Grid from './components/Grid'
import Floor from './components/Floor'
import useLevaControls, { getAtomWithStorage } from './components/hooks/useLevaControls'
import { Vector3 } from 'three'
import { atomWithStorage } from 'jotai/utils'
import { useAtom } from 'jotai'
import { useGetPublicKeyQuery } from './features/protocol/api/apiSlice'
import JSONPretty from 'react-json-pretty'
import 'react-json-pretty/themes/monikai.css'
import styles from './App.module.css'
import { getBox } from './components/utils/encryptionWrapper'

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

const websocketOptions = {
  host: { value: 'localhost:8086' },
  TLS: { value: 'no', options: ['no', 'yes'] }
}
const keyboardOptions = {
  sendStroke: { value: sendStroke.onKeyRelease, options: Object.keys(sendStroke) },
  lockPosition: { value: false, options: [true, false] },
  performanceMonitor: { value: false, options: [true, false] },
  showShadows: { value: true, options: [true, false] },
  show3DText: { value: true, options: [true, false] }
}

const wsOptionsAtom = getAtomWithStorage({ websocketOptions })
const kOptionsAtom = getAtomWithStorage({ keyboardOptions })

const initialCameraPosition = new Vector3(0, 6, 10)
const cameraAtom = atomWithStorage(
  'cameraPosition',
  initialCameraPosition,
  undefined,
  { getOnInit: true }
)

const Tunneled = () => {
  const { status } = useTunnelContext()
  const wsControls = useLevaControls({
    useControlsParams: ['Plover Web-socket Plugin', websocketOptions],
    atom: wsOptionsAtom
  })
  const { controls } = wsControls
  const isTLS = controls.TLS === 'yes'
  const urlPredicate = `://${controls.host}`
  const baseUrl = `${isTLS ? 'https' : 'http'}${urlPredicate}`

  const kControls = useLevaControls({
    useControlsParams: ['Keyboard', keyboardOptions],
    atom: kOptionsAtom
  })

  const publicKeyQuery = useGetPublicKeyQuery(baseUrl, { skip: wsControls.isLoading })
  const {
    data: publicKey,
    isError,
    error
  } = publicKeyQuery

  const secretOrSharedKey = useMemo(
    () => {
      if (!publicKey) return null
      return getBox(publicKey)
    }, [publicKey]
  )

  const isLoading = Boolean([kControls, wsControls, publicKeyQuery].find(a => a.isLoading))

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
          {kControls.controls.performanceMonitor && <Perf position='bottom-right' />}
          <ReactToCameraChange {...{ onCameraUpdate, trackCamera } }>
            {/* eslint-disable-next-line react/no-unknown-property */}
            <ambientLight intensity={0.5} />
            {/* eslint-disable-next-line react/no-unknown-property */}
            <directionalLight position={[10, 10, 5]} />
            <WebSocketProvider
              url={
                isLoading
                  ? 'ws://localhost:8086/dummy'
                  : `${isTLS ? 'wss' : 'ws'}${urlPredicate}/websocket`
              }
              secretOrSharedKey={secretOrSharedKey}
            >
              <StenoKeyboard controls={kControls.controls} />
            </WebSocketProvider>
            {kControls.controls.showShadows && <ContactShadows frames={1} position-y={-0.5} blur={1} opacity={0.75} />}
            <OrbitControls
              onEnd={onOrbitMotionEnd}
              zoomSpeed={0.25}
              minPolarAngle={0}
              dampingFactor={0.05}
              enableDamping={true}
              maxPolarAngle={Math.PI / 2.1}
              enableRotate={!kControls.controls.lockPosition}
              enablePan={!kControls.controls.lockPosition}
              enableZoom={!kControls.controls.lockPosition}
            />
            <Grid position={[0, -0.5, 0]} />
            <Floor position={[0, -0.5, 0]} />
          </ReactToCameraChange>
        </Canvas>
          <status.In className='child'>
            {
                isError &&
                  <JSONPretty id="json-pretty" data={error}></JSONPretty>
            }
          </status.In>
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
