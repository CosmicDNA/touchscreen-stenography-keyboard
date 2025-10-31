import PropTypes from 'prop-types'
import React, { useState, useRef, useEffect, useMemo } from 'react'
import KeyGroup from './KeyGroup'
import Key from './Key'
import { Vector3, MeshLambertMaterial, Color } from 'three'
import { useFrame } from '@react-three/fiber'
// import keySets from './steno-script'
import { useSound } from './hooks/use-sound'
import keypressAudioFile from '../sounds/keypress.flac'
import keyreleaseAudioFile from '../sounds/keyrelease.flac'
import { useWebSocketContext, ReadyState } from './hooks/useWebSocket'
import usePrevious from './hooks/usePrevious'
import { getAddedAndRemovedItems, dep } from './utils/tools'
import useWakeLock from './hooks/useWakeLock'
import KeyPressDetectionFloor from './KeyPressDetectionFloor'
import { toast } from 'react-toastify'
import { LookupStateEnum, convertLookupStrokeToKeysSequence } from './utils/lookup'

const enter = 0.2
const rowSpacing = 1.3
// const animate = false

const referencePosition = new Vector3(0.5, -2.4, 0)
const position = [
  [-0.5, 4.8, 0], // 0
  [-1, 3 * rowSpacing, 0], // 1
  [-5, 3 * rowSpacing, 0], // 2
  [4, 3 * rowSpacing, 0], // 3
  [4, 2 * rowSpacing, 0], // 4
  [-4, 3 * rowSpacing, 0], // 5
  [-4, 2 * rowSpacing, 0] // 6
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
  AH: { keyId: 'A-', order: 8, offsetX: -0.01, ox: -5 * rowSpacing - enter, oy: -1 * rowSpacing - 0.1, oz: -0.2 },
  OH: { keyId: 'O-', order: 9, offsetX: -0.02, ox: -5 * rowSpacing - enter, oy: -1 * rowSpacing - 0.1, oz: -0.2 },
  asterisk: { keyId: '*', order: 10, lateral: 2, round, offsetX: -0.05, grow: 'right', offsetY: -0.75 },
  HE: { keyId: '-E', order: 11, ox: -5 * rowSpacing + enter, oy: -1 * rowSpacing - 0.1, oz: -0.2 },
  HU: { keyId: '-U', order: 12, offsetX: -0.02, ox: -5 * rowSpacing + enter, oy: -1 * rowSpacing - 0.1, oz: -0.2 },
  HF: { keyId: '-F', order: 13 },
  HR: { keyId: '-R', order: 14, offsetX: -0.01 },
  HP: { keyId: '-P', order: 15 },
  HB: { keyId: '-B', order: 16 },
  HL: { keyId: '-L', order: 17 },
  HG: { keyId: '-G', order: 18, offsetX: -0.01 },
  HT: { keyId: '-T', order: 19 },
  HS: { keyId: '-S', order: 20 },
  HD: { keyId: '-D', order: 21, grow: 'left' },
  HZ: { keyId: '-Z', order: 22, grow: 'left' },
  dummy: null
}

const armPivotY = 6

const armLengths = [
  armPivotY - position[0].y,
  armPivotY - position[1].y,
  armPivotY - position[4].y
]

const config = [
  { type: 'Key', ...keys.sharp, position: position[0], armLength: armLengths[0] },
  { type: 'Key', ...keys.asterisk, position: position[1], armLength: armLengths[1] },
  { type: 'Key', ...keys.SH, position: position[2], armLength: armLengths[1] },
  { type: 'Key', ...keys.HD, position: position[3], lateral: 1.1, armLength: armLengths[1] },
  { type: 'Key', ...keys.HZ, position: position[4], round, armLength: armLengths[2] },
  { type: 'Row', keys: [keys.TH, keys.PH, keys.HH, keys.dummy, keys.HF, keys.HP, keys.HL, keys.HT], position: position[5], lateral: 1.1, armLength: armLengths[1] },
  { type: 'Row', keys: [keys.KH, keys.WH, keys.RH, keys.dummy, keys.HR, keys.HB, keys.HG, keys.HS, keys.AH, keys.OH, keys.HE, keys.HU], position: position[6], round, armLength: armLengths[2] }
]

const rowItems = config.filter(o => o.type === 'Row')
const emptySet = new Set()
const StenoKeyboard = ({ controls, isTouchDevice, ...props }) => {
  const ref = useRef()
  // eslint-disable-next-line no-unused-vars
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [lookupStrokes, setLookupStrokes] = useState(null)
  const [largestKeySet, setLargestKeySet] = useState(new Set())
  const [lookupState, setLookupState] = useState(LookupStateEnum.IDLE)

  // Instance materials once
  const keyMaterials = useMemo(() => {
    const colorA = '#90B6AF'
    const colorB = Color.NAMES.whitesmoke
    return [new MeshLambertMaterial({ color: colorA, wireframe: false }), new MeshLambertMaterial({ color: colorB, wireframe: false })]
  }, [])
  const [pressedKeys, setPressedKeys] = useState(new Map())
  useWakeLock()
  const { lastJsonMessage, sendJsonMessage, readyState } = useWebSocketContext()

  useEffect(() => {
    if (lastJsonMessage) {
      // console.log(lastJsonMessage)
      if (lastJsonMessage.on_stroked) {
        console.log(lastJsonMessage.on_stroked.paper)
      }
      // Only process the lookup result if we are expecting one.
      if (lastJsonMessage.lookup) {
        if (lastJsonMessage.lookup.length) {
          setLookupState(LookupStateEnum.LOOKUP_READY)
          // console.log('Successfully looked up:', lastJsonMessage.lookup)
          // The strategy is to get the most straight forward list of strokes
          const straightForwardStrokes = lastJsonMessage.lookup[0]
          // console.log('Straight forward strokes:', straightForwardStrokes)
          const keysSequence = convertLookupStrokeToKeysSequence(straightForwardStrokes)
          // console.log('Keys sequence:', keysSequence)
          setLookupStrokes(keysSequence)
        } else {
          console.error('Could not lookup for phrase!')
          setLookupState(LookupStateEnum.LOOKUP_ERROR)
        }
      }
    }
  }, [lastJsonMessage])

  // const lookupState = useRef(LookupStateEnum.IDLE)
  useEffect(() => {
    // Only attempt to send a lookup if the connection is open and we haven't sent one already.
    if (readyState === ReadyState.OPEN && lookupState === LookupStateEnum.IDLE && window.location.search.length) {
      const urlParams = new URLSearchParams(window.location.search)
      const phraseToLookup = urlParams.get('lookup')

      if (phraseToLookup) {
        // console.log('sending lookup:', phraseToLookup)
        sendJsonMessage({ lookup: phraseToLookup })
        setLookupState(LookupStateEnum.LOOKING_UP)
        // Optional: remove the query parameter from the URL to avoid re-sending on refresh
        // window.history.replaceState({}, document.title, window.location.pathname)
      }
    }
  }, [lookupState, readyState, sendJsonMessage])

  const skip = !soundEnabled
  const [playKeyPress] = useSound(keypressAudioFile, { skip })
  const [playKeyRelease] = useSound(keyreleaseAudioFile, { volume: 0.2, skip })

  const enableSound = () => {
    if (!soundEnabled) {
      setSoundEnabled(true)
    }
  }

  const onKeyPress = (keyId) => {
    enableSound()
    playKeyPress()
    // console.log(`Key ${keyId} was pressed.`)
  }

  const onKeyRelease = (keyId) => {
    enableSound()
    playKeyRelease()
    // console.log(`Key ${keyId} was released.`)
  }

  /**
   * Safely updates the `pressedKeys` state map.
   * This function takes a callback that receives a mutable copy of the current `pressedKeys` map.
   * The callback can then perform mutations (like `set` or `delete`) on this map.
   *
   * The map stores which keys are being pressed by which finger/source.
   * The key is a finger's `identifier` (number) or 'auto' (string) for automated presses.
   * The value is a `Set` or `Array` of `keyId` strings.
   * @param {(map: Map<number | string, Set<string> | string[]>) => void} callback The function that mutates the map.
   */
  const updatePressedKeys = (callback) => {
    setPressedKeys(prevPressedKeys => {
      const newMap = new Map(prevPressedKeys)
      callback(newMap)
      return newMap
    })
  }

  // Animate the keys
  useFrame(({ clock }) => {
    if (lookupState === LookupStateEnum.LOOKUP_READY) {
      const keySetsWithRest = [[], [], [], [], ...lookupStrokes]
      // const keySetsWithRest = [[], [], [], [], ...keySets]
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

  const registerStroke = (stroke) => {
    if (readyState === ReadyState.OPEN) {
      sendJsonMessage({ stroke })
    }
  }

  useEffect(() => {
    if (addedItems.size) {
      // console.log('Added items:', addedItems)
      if (controls.sendStroke === 'onKeyPress') {
        registerStroke([...addedItems])
      }
    }

    if (removedItems.size) {
      // console.log('Removed items:', removedItems)
    }
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [addedItems, removedItems].map(s => dep(s))
  )

  useEffect(() => {
    if (!allKeys.size) {
      if (largestKeySet.size && controls.sendStroke === 'onKeyRelease') {
        const stroke = [...largestKeySet]
        registerStroke(stroke)
        setLargestKeySet(new Set())
      }
    } else {
      if (allKeys.size > largestKeySet.size) {
        // Should record largest key set!
        setLargestKeySet(allKeys)
      }
    }
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [dep(allKeys), largestKeySet]
  )

  return (
    <group
      {...props}
      ref={ref} // eslint-disable-next-line react/no-unknown-property
      rotation-x={-Math.PI / 2} // eslint-disable-next-line react/no-unknown-property
    >
      {
        config.map((item, key) => {
          // Pass all necessary props to each key/keyGroup
          const keyProps = { ...item, key, allKeys, onKeyPress, onKeyRelease, materials: keyMaterials, show3DText: controls.show3DText, updatePressedKeys, onClick: !isTouchDevice ? () => toast('This app is designed for touchscreen devices!', { type: 'error' }) : undefined }
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
      <KeyPressDetectionFloor {...{ updatePressedKeys, pressedKeys }} position={[0, 0, -0.5]} isTouchDevice={isTouchDevice}/>
    </group>
  )
}

StenoKeyboard.propTypes = {
  controls: PropTypes.object.isRequired,
  isTouchDevice: PropTypes.bool.isRequired
}

export default StenoKeyboard
