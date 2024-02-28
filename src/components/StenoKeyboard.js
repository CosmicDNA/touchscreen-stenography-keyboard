import React, { useState, useRef } from 'react'
import KeyGroup from './KeyGroup'
import Key from './Key'
import * as THREE from 'three'

const enter = 0.2
const rowSpacing = 1.3

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
  { type: 'Row', keys: ['A', 'O'], position: position[5], round },
  { type: 'Row', keys: ['E', 'U'], position: position[6], round },
  { type: 'Row', keys: ['T-', 'P-', 'H-'], position: position[7], lateral: 1.1 },
  { type: 'Row', keys: ['K-', 'W-', 'R-'], position: position[8], round }
]

const rowItems = config.filter(o => o.type === 'Row')

const StenoKeyboard = (props) => {
  const ref = useRef()
  const [pressedKeys, setPressedKeys] = useState(new Map())

  const allKeys = new Set([...pressedKeys.values()].flatMap((set) => [...set]))
  return (
    <group
      {...props}
      ref={ref}
      // eslint-disable-next-line react/no-unknown-property
      rotation-x={-Math.PI / 2}
    >
      {
        config.map((item, key) => {
          let rowIndex
          switch (item.type) {
            case 'Key':
              return <Key {...{ ...item, key, setPressedKeys, pressedKeys, allKeys }} />
            case 'Row':
              rowIndex = rowItems
                .findIndex(o => JSON.stringify(o) === JSON.stringify(item))
              return <KeyGroup {...{ ...item, key, name: `g${rowIndex}`, setPressedKeys, pressedKeys, allKeys }} />
            default:
              return null
          }
        })
      }
    </group>
  )
}

export default StenoKeyboard
