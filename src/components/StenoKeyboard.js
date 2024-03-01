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
import { getAddedAndRemovedItems } from './utils/tools'

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
const config = [
  { type: 'Key', keyId: '#', width: 9.8, position: position[0] },
  { type: 'Key', keyId: '*', lateral: 2, position: position[1], round },
  { type: 'Key', keyId: 'S-', lateral: 2, position: position[2], round },
  { type: 'Row', keys: ['-F', '-P', '-L', '-T', '-D'], position: position[3], lateral: 1.1 },
  { type: 'Row', keys: ['-R', '-G', '-B', '-S', '-Z'], position: position[4], round },
  { type: 'Row', keys: ['A-', 'O-'], position: position[5], round },
  { type: 'Row', keys: ['-E', '-U'], position: position[6], round },
  { type: 'Row', keys: ['T-', 'P-', 'H-'], position: position[7], lateral: 1.1 },
  { type: 'Row', keys: ['K-', 'W-', 'R-'], position: position[8], round }
]

const rowItems = config.filter(o => o.type === 'Row')

const StenoKeyboard = (props) => {
  const ref = useRef()
  const [pressedKeys, setPressedKeys] = useState(new Map())
  const { lastJsonMessage, sendJsonMessage, secretkey } = useWebSocketContext()

  // sendMessage('close')
  console.log(lastJsonMessage)

  const [playKeyPress] = useSound(keypressAudioFile)
  const [playKeyRelease] = useSound(keyreleaseAudioFile, { volume: 0.7 })

  const onKeyPress = (keyId) => {
    playKeyPress()
    console.log(`Key ${keyId} was pressed.`)
  }

  const onKeyRelease = (keyId) => {
    playKeyRelease()
    console.log(`Key ${keyId} was released.`)
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
  const previousAllKeys = usePrevious(allKeys)

  const [addedItemsArray, removedItemsArray] = getAddedAndRemovedItems(allKeys, previousAllKeys)

  useEffect(() => {
    const addedItems = new Set(addedItemsArray)

    if (addedItemsArray.length) {
      console.log('Added items:', addedItems)
      sendJsonMessage({ stroke: addedItemsArray, secretkey })
    }

    const removedItems = new Set(removedItemsArray)

    if (removedItemsArray.length) {
      console.log('Removed items:', removedItems)
    }
  }, [addedItemsArray, removedItemsArray])

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
    </group>
  )
}

export default StenoKeyboard
