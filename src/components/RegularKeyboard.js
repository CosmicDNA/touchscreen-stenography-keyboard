import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { useRegularKeyGeometry } from './hooks/useRegularKeyGeometry'
import { RegularKey } from './RegularKey'
// import layout from '../components/utils/keyboardLayouts/fat-ass-enter-60.json'
// import layout from '../components/utils/keyboardLayouts/default-60.json'
import layout from '../components/utils/keyboardLayouts/iso-60.json'
import { useSound } from './hooks/use-sound'
import keypressAudioFile from '../sounds/keypress.flac'
import keyreleaseAudioFile from '../sounds/keyrelease.flac'
import { useWebSocketContext, ReadyState } from './hooks/useWebSocket'
import { dep } from './utils/tools'
import KeyPressDetectionFloor from './KeyPressDetectionFloor'
import { Box3, Vector3 } from 'three'
import { toast } from 'react-toastify'

/**
 * Renders a 3D regular keyboard based on a KLE JSON layout.
 */
const RegularKeyboard = () => {
  // Use the custom hook to get the calculated geometries for each key
  const groupRef = useRef()
  const geometries = useRegularKeyGeometry(layout)
  const [pressedKeys, setPressedKeys] = useState(new Map())
  const [largestKeySet, setLargestKeySet] = useState(new Set())
  const [soundEnabled, setSoundEnabled] = useState(false)
  const { sendJsonMessage, readyState } = useWebSocketContext()
  const skipSound = !soundEnabled
  const [playKeyPress] = useSound(keypressAudioFile, { skip: skipSound })
  const [playKeyRelease] = useSound(keyreleaseAudioFile, { volume: 0.2, skip: skipSound })
  const [size, setSize] = useState([0, 0, 0])

  useLayoutEffect(() => {
    if (groupRef.current) {
      const box = new Box3().setFromObject(groupRef.current)
      const sizeV = new Vector3()
      box.getSize(sizeV)
      setSize([sizeV.x, sizeV.y, sizeV.z])
    }
  }, [])

  const updatePressedKeys = (callback) => {
    setPressedKeys(prevPressedKeys => {
      const newMap = new Map(prevPressedKeys)
      callback(newMap)
      return newMap
    })
  }

  const allKeys = new Set([...pressedKeys.values()].flatMap((set) => [...set]))

  const registerStroke = (stroke) => {
    if (readyState === ReadyState.OPEN) {
      // We send the labels of the keys, not their internal IDs
      const keyIdToLabelMap = new Map(geometries.map(k => [k.id, k.label]))
      const strokeLabels = stroke.map(keyId => keyIdToLabelMap.get(keyId)).filter(Boolean)
      if (strokeLabels.length > 0) {
        console.log('Sending stroke:', strokeLabels)
        sendJsonMessage({ stroke: strokeLabels })
      }
    }
  }

  const enableSound = () => {
    if (!soundEnabled) {
      setSoundEnabled(true)
    }
  }

  const onKeyPress = (keyId) => {
    enableSound()
    playKeyPress()
  }

  const onKeyRelease = (keyId) => {
    enableSound()
    playKeyRelease()
  }

  useEffect(() => {
    if (!allKeys.size) { // All keys have been released
      if (largestKeySet.size) {
        registerStroke([...largestKeySet])
        setLargestKeySet(new Set()) // Reset for the next chord
      }
    } else { // Keys are being pressed
      if (allKeys.size > largestKeySet.size) {
        setLargestKeySet(allKeys) // Record the largest chord
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep(allKeys)])

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const clickHandler = !isTouchDevice ? () => toast('This app is designed for touchscreen devices!', { type: 'error' }) : undefined

  return (
    <group ref={groupRef} rotation-x={-Math.PI / 2} position={[-size[0] / 2, 0, 0]}>
      {geometries.map((keyGeo) => (
        <RegularKey
          key={keyGeo.id}
          {...keyGeo}
          allKeys={allKeys}
          onKeyPress={onKeyPress}
          onKeyRelease={onKeyRelease}
          onClick={clickHandler}
        />
      ))}
      <KeyPressDetectionFloor {...{ updatePressedKeys, pressedKeys }} position={[0, 0, -0.5]} isTouchDevice={isTouchDevice} />
    </group>
  )
}

export default RegularKeyboard
