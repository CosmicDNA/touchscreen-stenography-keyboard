import PropTypes from 'prop-types'
import React, { useState, useRef, useEffect } from 'react'
import KeyGroup from './KeyGroup'
import Key from './Key'
import { Vector3 } from 'three'
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

const referencePosition = new Vector3(0.5, -2.4, 0)
const position = [
  [-0.5, 4.8, 0],
  [-1, 3 * rowSpacing, 0],
  [-5, 3 * rowSpacing, 0],
  [0, 3 * rowSpacing, 0],
  [0, 2 * rowSpacing, 0],
  [-3 + enter, rowSpacing, 0],
  [-enter, rowSpacing, 0],
  [-4, 3 * rowSpacing, 0],
  [-4, 2 * rowSpacing, 0]
]
  .map(p => (new Vector3(...p))
    .add(referencePosition))

const round = true
const keys = {
  sharp: { keyId: '#', width: 9.7, offsetY: 0.15, order: 0 },
  SH: { keyId: 'S-', lateral: 2, round, offsetY: -0.72, order: 1 },
  TH: { keyId: 'T-', order: 2 },
  KH: { keyId: 'K-', order: 3 },
  PH: { keyId: 'P-', order: 4 },
  WH: { keyId: 'W-', order: 5, offsetX: -0.06 },
  HH: { keyId: 'H-', order: 6 },
  RH: { keyId: 'R-', order: 7 },
  AH: { keyId: 'A-', order: 8, offsetX: -0.01 },
  OH: { keyId: 'O-', order: 9, offsetX: -0.02 },
  asterisk: { keyId: '*', order: 10, lateral: 2, round, offsetX: -0.05, grow: 'right', offsetY: -0.75 },
  HE: { keyId: '-E', order: 11 },
  HU: { keyId: '-U', order: 12, offsetX: -0.02 },
  HF: { keyId: '-F', order: 13 },
  HR: { keyId: '-R', order: 14, offsetX: -0.01 },
  HP: { keyId: '-P', order: 15 },
  HB: { keyId: '-B', order: 16 },
  HL: { keyId: '-L', order: 17 },
  HG: { keyId: '-G', order: 18, offsetX: -0.01 },
  HT: { keyId: '-T', order: 19 },
  HS: { keyId: '-S', order: 20 },
  HD: { keyId: '-D', order: 21, grow: 'left' },
  HZ: { keyId: '-Z', order: 22, grow: 'left' }
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

  const getTypedKeys = (lastJsonMessage) =>
    Object.values(keys)
      .filter(k => lastJsonMessage.keys.includes(k.keyId))

  const getPaperPlaceHolder = (typedKeys) => {
    const paperPlaceHolder = Array.from({ length: Object.keys(keys).length }, () => '')
    typedKeys.forEach(tk => {
      paperPlaceHolder[tk.order] = tk.keyId.replace('-', '')
    })
    return paperPlaceHolder
  }

  useEffect(() => {
    if (lastJsonMessage) {
      const typedKeys = getTypedKeys(lastJsonMessage)
      const paperPlaceHolder = getPaperPlaceHolder(typedKeys)
      console.log(paperPlaceHolder)
    }
  }, [lastJsonMessage])

  const [playKeyPress] = useSound(keypressAudioFile)
  const [playKeyRelease] = useSound(keyreleaseAudioFile, { volume: 0.2 })

  const onKeyPress = (keyId) => {
    playKeyPress()
    // console.log(`Key ${keyId} was pressed.`)
  }

  const onKeyRelease = (keyId) => {
    playKeyRelease()
    // console.log(`Key ${keyId} was released.`)
  }

  const updatePressedKeys = (callback) => {
    setPressedKeys(prevPressedKeys => {
      const newMap = new Map(prevPressedKeys)
      callback(newMap)
      return newMap
    })
  }

  // Animate the keys
  useFrame(({ clock }) => {
    if (animate) {
      const keySetsWithRest = [[], [], [], [], ...keySets]
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

      updatePressedKeys(map => map.set('auto', combinedKeySet))
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
    if (!allKeys.size) {
      if (largestKeySet.size && controls.sendStroke === 'onKeyRelease') {
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
  }, [dep(allKeys), largestKeySet])

  return (
    <group
      {...props}
      ref={ref}
      // eslint-disable-next-line react/no-unknown-property
      rotation-x={-Math.PI / 2}
    >
      {
        config.map((item, key) => {
          const keyProps = { ...item, key, allKeys, onKeyPress, onKeyRelease }
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
      {/* <Floor {...{ updatePressedKeys, pressedKeys, keyId: 'floor' }} position-z={-0.5} position-y={0} /> */}
      <HexagonFloor {...{ updatePressedKeys, pressedKeys }} position={[0, 0, -0.5]}/>
    </group>
  )
}

StenoKeyboard.propTypes = {
  controls: PropTypes.object.isRequired
}

export default StenoKeyboard
