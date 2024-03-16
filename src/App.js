import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import StenoKeyboard from './components/StenoKeyboard'
import { WebSocketProvider } from './components/hooks/useWebSocket'
import { TunnelProvider, useTunnelContext } from './components/hooks/useTunnel'
import Grid from './components/Grid'
import useLevaControls, { getAtomWithStorage } from './components/hooks/useLevaControls'
import { Vector3 } from 'three'
import { atomWithStorage } from 'jotai/utils'
import { useAtom } from 'jotai'
import { useGetPublicKeyQuery } from './features/protocol/api/apiSlice'
import JSONPretty from 'react-json-pretty'
import 'react-json-pretty/themes/monikai.css'
import styles from './App.module.css'

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
  host: { value: 'localhost' },
  port: { value: 8086, min: 1024, max: 49151, step: 1 },
  TLS: { value: 'no', options: ['no', 'yes'] }
}
const keyboardOptions = {
  sendStroke: { value: sendStroke.onKeyRelease, options: Object.keys(sendStroke) },
  lockPosition: { value: false, options: [true, false] }
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
  const urlPredicate = `://${controls.host}:${controls.port}`
  const baseUrl = `${isTLS ? 'https' : 'http'}${urlPredicate}`

  const kControls = useLevaControls({
    useControlsParams: ['Keyboard', keyboardOptions],
    atom: kOptionsAtom
  })

  const publicKeyQuery = useGetPublicKeyQuery(baseUrl)
  const {
    data: publicKey,
    isError,
    error
  } = publicKeyQuery

  const isLoading = Boolean([kControls, wsControls, publicKeyQuery].find(a => a.isLoading))

  const [persistentCameraPosition, setPersistentCameraPosition] = useAtom(cameraAtom)
  const [trackCamera, setTrackCamera] = useState(false)

  if (isLoading) return <>Loading...</>

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
          <ReactToCameraChange {...{ onCameraUpdate, trackCamera } }>
            {/* eslint-disable-next-line react/no-unknown-property */}
            <ambientLight intensity={0.5} />
            {/* eslint-disable-next-line react/no-unknown-property */}
            <directionalLight position={[10, 10, 5]} />
            <WebSocketProvider
              url={
                !isLoading &&
                  `${isTLS ? 'wss' : 'ws'}${urlPredicate}/websocket`
              }
              publicKey={publicKey}
            >
              <StenoKeyboard controls={kControls.controls} />
            </WebSocketProvider>
            <ContactShadows frames={3} position-y={-0.5} blur={1} opacity={0.75} />
            {/* <ContactShadows frames={1} position-y={-0.5} blur={3} color="orange" /> */}
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

// import React, { useEffect } from 'react'
// import { useDispatch, useSelector } from 'react-redux'
// import { setSecret } from './features/secret/secretSlice'

// const App = () => {
//   const dispatch = useDispatch()
//   useEffect(() => {
//     dispatch(setSecret(253))
//   }, [])

//   const currentSecret = useSelector((state) => state.secret.secret)
//   console.log(currentSecret)
//   return (
//     <>
//       <>{currentSecret}</>
//     </>
//   )
// }

// export default App
