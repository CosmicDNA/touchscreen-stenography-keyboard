import PropTypes from 'prop-types'
import React from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import StenoKeyboard from './components/StenoKeyboard'
import { WebSocketProvider } from './components/hooks/useWebSocket'
import { TunnelProvider, useTunnelContext } from './components/hooks/useTunnel'
import Grid from './components/Grid'
import useLevaControls, { getAtom } from './components/hooks/useLevaControls'

import { atomWithStorage } from 'jotai/utils'
import { useAtom } from 'jotai'
// import useProtocol from './components/hooks/useProtocol'
import { useGetProtocolQuery } from './features/protocol/api/apiSlice'
import { useDispatch, useSelector } from 'react-redux'
import { setSecret } from './features/secret/secretSlice'

const ReactToCameraChange = ({ setCameraPosition, children }) => {
  useFrame(({ camera }) => {
    setCameraPosition(camera.position)
  })

  return (
    <>
      {children}
    </>
  )
}
ReactToCameraChange.propTypes = {
  setCameraPosition: PropTypes.func.isRequired,
  children: PropTypes.any
}

const sendStroke = {
  onKeyPress: 'onKeyPress',
  onKeyRelease: 'onKeyRelease'
}

const websocketOptions = {
  host: { value: 'localhost' },
  port: { value: 8086, min: 1024, max: 49151, step: 1 },
  path: { value: '/websocket' },
  secret: { value: 'mysecretkey' }
}
const keyboardOptions = {
  sendStroke: { value: sendStroke.onKeyRelease, options: Object.keys(sendStroke) },
  lockPosition: { value: false, options: [true, false] }
}

const wsOptionsAtom = getAtom({ websocketOptions })
// const kOptionsAtom = getAtom({ keyboardOptions })

const cameraAtom = atomWithStorage('cameraPosition', [0, 6, 10])

const Tunneled = ({ ...props }) => {
  const dispatch = useDispatch()
  const currentSecret = useSelector((state) => state.secretSlice.secret) // Replace with your actual slice name
  // console.log(currentSecret, dispatch, setSecret)
  const { status } = useTunnelContext()
  const wsControls = useLevaControls({
    useControlsParams: ['Plover Web-socket Plugin', websocketOptions],
    atom: wsOptionsAtom
  })
  // const kControls = useLevaControls({
  //   useControlsParams: ['Keyboard', keyboardOptions],
  //   atom: kOptionsAtom
  // })
  const kControls = getAtom(keyboardOptions)
  const [cameraPosition, setCameraPosition] = useAtom(cameraAtom)

  // const protocol = useProtocol(wsControls.controls.secret, wsControls.loading)

  const {
    data: protocol,
    isLoading,
    // isSuccess,
    isError,
    error
  } = useGetProtocolQuery()

  if ([wsControls, kControls].find(a => a.loading)) return <>Loading...</>
  if (isError) return <>{error}</>
  const { controls } = wsControls
  console.log({ currentSecret, secret: controls.secret, isLoading })
  if (currentSecret !== controls.secret) {
    console.log(controls.secret)
    dispatch(setSecret(controls.secret))
  } else {
    console.log('Hello to you!')
  }

  return (
    <>
      <header>
        <status.Out />
      </header>
      <Canvas camera={{ position: Object.values(cameraPosition), fov: 25 }}>
        <ReactToCameraChange setCameraPosition={setCameraPosition}>
          {/* eslint-disable-next-line react/no-unknown-property */}
          <ambientLight intensity={0.5} />
          {/* eslint-disable-next-line react/no-unknown-property */}
          <directionalLight position={[10, 10, 5]} />
          {/* <Suspense fallback={<status.In>Loading ...</status.In>}> */}
          <WebSocketProvider
            url={`${protocol.data}${controls.host}:${controls.port}${controls.path}`}
            secretkey={controls.secret}
          >
            <StenoKeyboard controls={kControls} />
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
            enableRotate={!kControls.lockPosition}
            enablePan={!kControls.lockPosition}
            enableZoom={!kControls.lockPosition}
          />
          <Grid position={[0, -0.5, 0]} />
        </ReactToCameraChange>
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
