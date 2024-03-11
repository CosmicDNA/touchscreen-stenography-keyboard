import PropTypes from 'prop-types'
import React, { useState, useRef, useEffect } from 'react'
import KeyGroup from './KeyGroup'
import Key from './Key'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import keySets from './steno-script'
import useSound from 'use-sound'
import keypressAudioFile from '../sounds/keypress.flac'
import keyreleaseAudioFile from '../sounds/keyrelease.flac'
import { useWebSocketContext } from './hooks/useWebSocket'
import usePrevious from './hooks/usePrevious'
import { getAddedAndRemovedItems, dep } from './utils/tools'
import HexagonFloor from './HexagonFloor'

const enter = 0.2
const rowSpacing = 1.3
const animate = false

const referencePosition = new THREE.Vector3(0.5, -2.4, 0)
const position = [
  [-0.5, 4.8, 0],
  [-1, 3 * rowSpacing, 0],
  [-5, 3 * rowSpacing, 0],
  [0, 3 * rowSpacing, 0],
  [0, 2 * rowSpacing, 0],
  [-enter, rowSpacing, 0],
  [-3 + enter, rowSpacing, 0],
  [-4, 3 * rowSpacing, 0],
  [-4, 2 * rowSpacing, 0]
]
  .map(p => (new THREE.Vector3(...p))
    .add(referencePosition))

const round = true
const keys = {
  sharp: { keyId: '#', width: 9.7, offsetY: 0.15 },
  asterisk: { keyId: '*', lateral: 2, round, offsetX: -0.05, grow: 'right', offsetY: -0.75 },
  SH: { keyId: 'S-', lateral: 2, round, offsetY: -0.72 },
  HD: { keyId: '-D', grow: 'left' },
  HZ: { keyId: '-Z', grow: 'left' },
  HF: { keyId: '-F' },
  HP: { keyId: '-P' },
  HL: { keyId: '-L' },
  HT: { keyId: '-T' },
  HR: { keyId: '-R', offsetX: -0.01 },
  HG: { keyId: '-G', offsetX: -0.01 },
  HB: { keyId: '-B' },
  HS: { keyId: '-S' },
  AH: { keyId: 'A-', offsetX: -0.01 },
  OH: { keyId: 'O-', offsetX: -0.02 },
  HE: { keyId: '-E' },
  HU: { keyId: '-U', offsetX: -0.02 },
  TH: { keyId: 'T-' },
  PH: { keyId: 'P-' },
  HH: { keyId: 'H-' },
  KH: { keyId: 'K-' },
  WH: { keyId: 'W-', offsetX: -0.06 },
  RH: { keyId: 'R-' }
}

const config = [
  { type: 'Key', ...keys.sharp, position: position[0] },
  { type: 'Key', ...keys.asterisk, position: position[1] },
  { type: 'Key', ...keys.SH, position: position[2] },
  { type: 'Row', keys: [keys.HF, keys.HP, keys.HL, keys.HT, keys.HD], position: position[3], lateral: 1.1 },
  { type: 'Row', keys: [keys.HR, keys.HG, keys.HB, keys.HS, keys.HZ], position: position[4], round },
  { type: 'Row', keys: [keys.AH, keys.OH], position: position[5], round },
  { type: 'Row', keys: [keys.HE, keys.HU], position: position[6], round },
  { type: 'Row', keys: [keys.TH, keys.PH, keys.HH], position: position[7], lateral: 1.1 },
  { type: 'Row', keys: [keys.KH, keys.WH, keys.RH], position: position[8], round }
]

const rowItems = config.filter(o => o.type === 'Row')
const emptySet = new Set()
const StenoKeyboard = ({ controls, ...props }) => {
  const ref = useRef()
  const [largestKeySet, setLargestKeySet] = useState(new Set())
  const [pressedKeys, setPressedKeys] = useState(new Map())
  const { lastJsonMessage, sendJsonMessage } = useWebSocketContext()

  // sendMessage('close')
  useEffect(() => {
    if (lastJsonMessage) {
      console.log(lastJsonMessage)
    }
  }, [lastJsonMessage])

  const [playKeyPress] = useSound(keypressAudioFile)
  const [playKeyRelease] = useSound(keyreleaseAudioFile, { volume: 0.7 })

  const onKeyPress = (keyId) => {
    playKeyPress()
    // console.log(`Key ${keyId} was pressed.`)
  }

  const onKeyRelease = (keyId) => {
    playKeyRelease()
    // console.log(`Key ${keyId} was released.`)
  }

  // Animate the keys
  useFrame(({ clock }) => {
    if (animate) {
      const keySetsWithRest = [...keySets, [], []]
      const elapsedTime = clock.getElapsedTime()
      const speed = 1 // Adjust the typing speed
      const ratio = 0.6 // chord/blank ratio

      const referenceTime = elapsedTime * speed

      // Calculate the current word index based on elapsed time
      const wordIndex = Math.floor(referenceTime) // Change word every second

      // Get the current key set for the word
      const currentKeySet = keySetsWithRest[wordIndex % keySetsWithRest.length]

      const delta = referenceTime - wordIndex

      // Combine the current key set and the empty set
      const combinedKeySet = delta < ratio ? currentKeySet : []

      setPressedKeys(prevPressedKeys => {
        const newMap = new Map(prevPressedKeys)
        newMap.set('#', combinedKeySet)
        return newMap
      })
    }
  })

  const allKeys = new Set([...pressedKeys.values()].flatMap((set) => [...set]))
  // eslint-disable-next-line no-unused-vars
  const [previousAllKeys, setPreviousAllKeys] = usePrevious(allKeys, emptySet)
  const [addedItems, removedItems] = getAddedAndRemovedItems(allKeys, previousAllKeys)

  useEffect(() => {
    if (addedItems.size) {
      // console.log('Added items:', addedItems)
      if (controls.sendStroke === 'onKeyPress') {
        sendJsonMessage({ stroke: [...addedItems] })
      }
    }

    if (removedItems.size) {
      // console.log('Removed items:', removedItems)
    }
  }, [addedItems, removedItems].map(s => dep(s)))

  useEffect(() => {
    if (allKeys.size === 0) {
      if (controls.sendStroke === 'onKeyRelease') {
        const stroke = [...largestKeySet]
        sendJsonMessage({ stroke })
        setLargestKeySet(new Set())
      }
    } else {
      if (allKeys.size > largestKeySet.size) {
        // Should record largest key set!
        setLargestKeySet(allKeys)
      }
    }
  }, [dep(allKeys)])

  return (
    <group
      {...props}
      ref={ref}
      // eslint-disable-next-line react/no-unknown-property
      rotation-x={-Math.PI / 2}
    >
      {
        config.map((item, key) => {
          const keyProps = { ...item, key, setPressedKeys, pressedKeys, allKeys, onKeyPress, onKeyRelease }
          let rowIndex
          switch (item.type) {
            case 'Key':
              return <Key {...keyProps} />
            case 'Row':
              rowIndex = rowItems
                .findIndex(o => JSON.stringify(o) === JSON.stringify(item))
              return <KeyGroup {...{ ...keyProps, name: `g${rowIndex}` }} />
            default:
              return null
          }
        })
      }
      {/* <Floor {...{ setPressedKeys, pressedKeys, keyId: 'floor' }} position-z={-0.5} position-y={0} /> */}
      <HexagonFloor {...{ setPressedKeys, pressedKeys }} position={[0, 0, -0.5]}/>
    </group>
  )
}

StenoKeyboard.propTypes = {
  controls: PropTypes.object.isRequired
}

export default StenoKeyboard
