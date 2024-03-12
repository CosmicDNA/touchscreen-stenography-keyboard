import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import StenoKeyboard from './components/StenoKeyboard'
import { WebSocketProvider } from './components/hooks/useWebSocket'
import { TunnelProvider, useTunnelContext } from './components/hooks/useTunnel'
import Grid from './components/Grid'
import useLevaControls, { getAtomWithStorage } from './components/hooks/useLevaControls'

import { atomWithStorage } from 'jotai/utils'
import { useAtom } from 'jotai'
import { useGetProtocolQuery } from './features/protocol/api/apiSlice'
import { useSelector, useDispatch } from 'react-redux'
import { setSecret } from './features/secret/secretSlice'
import JSONPretty from 'react-json-pretty'
import 'react-json-pretty/themes/monikai.css'

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

const wsOptionsAtom = getAtomWithStorage({ websocketOptions })
const kOptionsAtom = getAtomWithStorage({ keyboardOptions })

const cameraAtom = atomWithStorage('cameraPosition', [0, 6, 10])

const Tunneled = () => {
  const { status } = useTunnelContext()
  const wsControls = useLevaControls({
    useControlsParams: ['Plover Web-socket Plugin', websocketOptions],
    atom: wsOptionsAtom
  })
  const { controls } = wsControls

  const kControls = useLevaControls({
    useControlsParams: ['Keyboard', keyboardOptions],
    atom: kOptionsAtom
  })

  const currentSecret = useSelector((state) => state.secret.secret)
  const didSecretChange = currentSecret !== controls.secret
  const skip = !currentSecret || didSecretChange

  const protocolQuery = useGetProtocolQuery(null, { skip })
  const {
    data: protocol,
    // isLoading,
    isSuccess,
    isError,
    error
  } = protocolQuery

  const isLoading = Boolean([kControls, wsControls].find(a => a.isLoading))

  // eslint-disable-next-line no-unused-vars
  const [cameraPosition, setCameraPosition] = useAtom(cameraAtom)
  const dispatch = useDispatch()

  useEffect(() => {
    // console.log({ isLoading, currentSecret, constrolsSecret: controls.secret })
    if (!isLoading) {
      if (didSecretChange) {
        // console.log(controls.secret)
        // console.log('Dispatching')
        dispatch(setSecret(controls.secret))
      }
    }
  }, [isLoading, currentSecret, controls.secret])

  if (isLoading || protocolQuery.isLoading) return <>Loading...</>
  // console.log({ wsControls, kControls })
  // if (isError) return <>{error}</>
  // console.log({ useGetProtocolQuery, currentSecret, secret: controls.secret }) // , isLoading, protocol, isError, error
  // console.log({ isLoading, protocol, isError, error })

  return (
    <>
      <header>
        <status.Out />
      </header>
      {<status.In>
      {
        isSuccess
          ? `got protocol ${protocol}`
          : isError
            ? <JSONPretty id="json-pretty" data={error}></JSONPretty>
            : 'dummy'
      }
      </status.In>}
      <Canvas camera={{ position: Object.values(cameraPosition), fov: 25 }}>
        {/* <ReactToCameraChange setCameraPosition={setCameraPosition}> */}
          {/* eslint-disable-next-line react/no-unknown-property */}
          <ambientLight intensity={0.5} />
          {/* eslint-disable-next-line react/no-unknown-property */}
          <directionalLight position={[10, 10, 5]} />
          {/* <Suspense fallback={<status.In>Loading ...</status.In>}> */}
          <WebSocketProvider
            url={
              isSuccess
                ? `${protocol}${controls.host}:${controls.port}${controls.path}`
                : 'ws://localhost:8086/dummy'
            }
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
        {/* </ReactToCameraChange> */}
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

// import React from 'react'
// import useLevaControls, { getAtomWithStorage } from './components/hooks/useLevaControls'

// const websocketOptions = {
//   // host: { value: 'localhost' },
//   // port: { value: 8086, min: 1024, max: 49151, step: 1 },
//   // path: { value: '/websocket' },
//   secret: { value: 'mysecretkey' }
// }
// const wsOptionsAtom = getAtomWithStorage({ websocketOptions })

// const App = () => {
//   const wsControls = useLevaControls({
//     useControlsParams: ['Plover Web-socket Plugin', websocketOptions],
//     atom: wsOptionsAtom
//   })
//   if (wsControls.isLoading) return <>Loading ...</>
//   console.log(wsControls.controls)
//   return (
//     <>
//       {JSON.stringify(wsControls.controls)}
//     </>
//   )
// }

// export default App
