import PropTypes from 'prop-types'
import React, { useState, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import StenoKeyboard from './components/StenoKeyboard'
import { WebSocketProvider, useWebSocketContext } from './components/hooks/useWebSocket'
import { TunnelProvider, useTunnelContext } from './components/hooks/useTunnel.js'
import Grid from './components/Grid'
import { Vector3 } from 'three'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import { useAtom } from 'jotai'
// import JSONPretty from 'react-json-pretty'
import 'react-json-pretty/themes/monikai.css'
import styles from './App.module.css' // This import is now used
import useTheme from './components/hooks/useTheme'
import usePersistedControls from './components/hooks/use-persisted-controls.js'
import useFullScreen from './components/hooks/useFullScreen.js'
import { ToastContainer, toast } from 'react-toastify'
import { Scanner } from '@yudiel/react-qr-scanner'
import { getClientPublicKeyHex } from './components/utils/encryptionWrapper.js'
import useUrlParam from './components/hooks/use-url-param.js'

const publicKey = getClientPublicKeyHex()

/**
 * @param {String} _url
 */
const getBaseAndParams = (_url) => {
  // console.log(`URL is ${_url}`)
  const url = new URL(_url)
  const { searchParams, origin, pathname } = url
  const searchParamsEntries = Object.fromEntries(searchParams.entries())

  const base = origin + pathname
  // console.log(`Base is ${base} and search params are`, searchParamsEntries)
  return { base, searchParamsEntries }
}

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

const websocketUrlAtom = atomWithStorage(
  'websocketUrl',
  null,
  createJSONStorage(() => sessionStorage)
)

const SessionHandler = () => {
  const { lastJsonMessage } = useWebSocketContext()
  const [websocketUrl, setWebsocketUrl] = useAtom(websocketUrlAtom)

  useEffect(() => {
    const newToken = lastJsonMessage?.newTabletToken
    const currentToken = websocketUrl?.searchParamsEntries?.token

    if (newToken && newToken !== currentToken) {
      console.info('Received new session token, updating storage.')
      toast.success('Session secured with new token')
      setWebsocketUrl(prev => {
        if (!prev) return prev
        return {
          ...prev,
          searchParamsEntries: {
            ...prev.searchParamsEntries,
            token: newToken
          }
        }
      })
    }
  }, [lastJsonMessage, setWebsocketUrl, websocketUrl])

  return null
}

const Tunneled = () => {
  const { status } = useTunnelContext()
  const [showScanner, setShowScanner] = useState(false)
  const kControls = usePersistedControls('Keyboard', kSchema)
  const [storedWebsocketUrl, setStoredWebsocketUrl] = useAtom(websocketUrlAtom)
  const [activeWebsocketUrl, setActiveWebsocketUrl] = useState(storedWebsocketUrl)

  useEffect(() => {
    if (storedWebsocketUrl && !activeWebsocketUrl) {
      setActiveWebsocketUrl(storedWebsocketUrl)
    }
  }, [storedWebsocketUrl, activeWebsocketUrl])

  const theme = useTheme()

  const isTouchDevice = useMemo(() => ('ontouchstart' in window) || (navigator.maxTouchPoints > 0), [])

  useFullScreen(!isTouchDevice)

  const floorColor = theme === 'dark' ? 'black' : '#f0f0f0'

  useEffect(() => {
    document.body.style.backgroundColor = floorColor
  }, [floorColor])

  const [persistentCameraPosition, setPersistentCameraPosition] = useAtom(cameraAtom)
  const [trackCamera, setTrackCamera] = useState(false)

  const onOrbitMotionEnd = (event) => {
    setTrackCamera(true)
  }

  const relay = useUrlParam('relay')

  // const lookupState = useRef(LookupStateEnum.IDLE)
  useEffect(() => {
    if (relay) {
      console.log('Relay URL parameter detected:', relay)

      const newUrlData = getBaseAndParams(relay)
      setStoredWebsocketUrl(newUrlData)
      setActiveWebsocketUrl(newUrlData)
      console.info(`WebSocket URL set to ${relay}`)

      // Optional: remove the relay parameter from the URL to avoid re-sending on refresh
      const url = new URL(window.location.href)
      url.searchParams.delete('relay')
      // Reconstruct the URL without the 'relay' parameter and update the browser history
      window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`)
    }
  }, [relay, setStoredWebsocketUrl])

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

  const gridY = -0.5

  /**
   * @param {import ('@yudiel/react-qr-scanner').IDetectedBarcode[]} results
   */
  const handleScan = (results) => {
    const aScan = results.find(result => result?.rawValue)
    if (aScan) {
      try {
        const url = new URL(aScan.rawValue) // This will throw if it's not a valid URL
        const urlParams = new URLSearchParams(url.search)
        const relay = urlParams.get('relay')
        const newUrlData = getBaseAndParams(relay)
        setStoredWebsocketUrl(newUrlData)
        setActiveWebsocketUrl(newUrlData)
        console.debug('Scanned QR code result', aScan)
        console.info(`WebSocket URL set to ${aScan.rawValue}`)
        setShowScanner(false)
      } catch (e) {
        console.error('Scanned QR code is not a valid URL', e)
      }
    }
  }

  const queryParams = useMemo(() => ({ publicKey, ...activeWebsocketUrl?.searchParamsEntries }), [activeWebsocketUrl])
  // const queryParams = { ...websocketUrl?.searchParamsEntries }
  // console.log({ queryParams })

  return (
    <div className={parent}>
      {showScanner && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 100, background: 'black' }}>
          <Scanner
            onScan={handleScan}
            constraints={{ facingMode: 'environment' }}
          />
          <button style={{ position: 'absolute', top: '20px', right: '20px' }} onClick={() => setShowScanner(false)}>Cancel</button>
        </div>
      )}
      <div className={child}>
        <status.Out />
        <button className={styles.button} onClick={() => setShowScanner(true)}>Scan QR</button>
      </div>
      <div>
        <ToastContainer theme={theme}/>
      </div>
      <Canvas shadows camera={{ position: Object.values(persistentCameraPosition), fov: 25 }}>
        {kControls.performanceMonitor && <Perf position='bottom-right' />}
        <ReactToCameraChange {...{ onCameraUpdate, trackCamera }}>
          <ambientLight intensity={0.5} />
          <directionalLight
            castShadow={kControls.showShadows}
            intensity={0.5}
            position={[0, 5, -10]}
            shadow-mapSize-width={512}
            shadow-mapSize-height={512}
            shadow-camera-far={50}
          />
          <WebSocketProvider
            url={activeWebsocketUrl?.base}
            queryParams={queryParams}
          >
            <SessionHandler />
            <StenoKeyboard controls={kControls} isTouchDevice={isTouchDevice}/>
          </WebSocketProvider>
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
          <mesh
            receiveShadow rotation-x={-Math.PI / 2} position-y={gridY - 0.02}>
            <planeGeometry
              args={[100, 100]}
            />
            <meshStandardMaterial color={floorColor} />
          </mesh>
          <Grid position={[0, gridY, 0]} />
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
