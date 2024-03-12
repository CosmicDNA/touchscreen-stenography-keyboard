import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { Color, Shape, Vector2 } from 'three'
import { getCircularPoints } from './utils/tools'
import useMount from './hooks/useMount'
import { Text3D } from '@react-three/drei'
import InterMediumRegular from '../fonts/Inter_Medium_Regular.json'

/**
 * Represents a Key component.
 * @typedef {Object} KeyProps
 * @property {Number} roundResolution - The resolution for rounding.
 * @property {Number} fingerResolution - The resolution of the finger for raycasting.
 * @property {Number} width - The width of the key.
 * @property {Number} lateral - The lateral dimension of the key.
 * @property {Number} depth - The depth of the key.
 * @property {String} keyId - The unique identifier for the key.
 * @property {Number} round - The current round.
 * @property {function} setPressedKeys - A function to set pressed keys.
 * @property {Map<String, Set<String>>} pressedKeys - A Map where keys are strings and values can be of any type.
 * @property {Set<String>} allKeys - Set of pressed keys.
 * @property {...any} props - Additional props.
 */

/**
 * Key component.
 * @param {KeyProps} props - The props object.
 */
const Key = ({ offsetX = 0, offsetY = 0, scale = 1, roundResolution = 32, fingerResolution = 5, width = 7 / 10, lateral = 7 / 10, depth = 1 / 20, keyId, round, grow, setPressedKeys, pressedKeys, allKeys, ...props }) => {
  const { onKeyPress, onKeyRelease } = props
  const { isMounted } = useMount()
  const widthOnTwo = width / 2

  const pressed = allKeys.has(keyId)

  // Watch for changes in the 'pressed' variable
  useEffect(() => {
    if (isMounted) {
      if (pressed) {
        // Trigger onKeyPress event here when 'pressed' becomes true
        onKeyPress(keyId)
      } else {
        // Trigger onKeyRelease event here when 'pressed' becomes false
        onKeyRelease(keyId)
      }
    }
  }, [pressed])

  let addLeft, addRight
  switch (grow) {
    case 'left':
      addLeft = 0.1
      addRight = 0
      break
    case 'right':
      addLeft = 0
      addRight = 0.1
      break
    default:
      addLeft = 0
      addRight = 0
      break
  }

  let pts
  if (round) {
    const radius = widthOnTwo
    const underSemiCircumference = getCircularPoints(
      roundResolution / 2 + 1,
      roundResolution,
      radius,
      Math.PI
    )

    const pre = [
      [underSemiCircumference[0][0] - addLeft, underSemiCircumference[0][1] + lateral],
      [underSemiCircumference[0][0] - addLeft, underSemiCircumference[0][1]]
    ]
    const pos = [
      [underSemiCircumference[underSemiCircumference.length - 1][0] + addRight, underSemiCircumference[underSemiCircumference.length - 1][1]],
      [underSemiCircumference[underSemiCircumference.length - 1][0] + addRight, underSemiCircumference[underSemiCircumference.length - 1][1] + lateral]
    ]

    pts = [...pre, ...underSemiCircumference, ...pos]
  } else {
    pts = [[-widthOnTwo - addLeft, 0], [-widthOnTwo - addLeft, lateral], [widthOnTwo + addRight, lateral], [widthOnTwo + addRight, 0]]
  }

  const extrudeSettings = {
    depth,
    steps: 1,
    bevelEnabled: true,
    bevelThickness: 8 / 200,
    bevelSize: 0.4 * 8 / 40,
    bevelSegments: 1
  }

  const colorA = '#90B6AF'
  const colorB = Color.NAMES.whitesmoke

  return (
    <group
      {...props}
      // eslint-disable-next-line react/no-unknown-property
      rotation-x={pressed ? Math.PI / 32 * (4 / 10 + 7 / 10) / (lateral + widthOnTwo) : 0}
      // eslint-disable-next-line react/no-unknown-property
      position-z={pressed ? -0.1 : 0}
    >
      <mesh
        // eslint-disable-next-line react/no-unknown-property
        position-y={-lateral}
        // eslint-disable-next-line react/no-unknown-property
        userData={{ keyId }}
      >
        {[colorA, colorB].map((color, i) =>
          // eslint-disable-next-line react/no-unknown-property
          <meshLambertMaterial key={i} attach={`material-${i}`} args={[{ color, wireframe: false }]} />
        )}
        {/* eslint-disable-next-line react/no-unknown-property */}
        <extrudeGeometry args={[new Shape(pts.map(points => new Vector2(...points))), extrudeSettings]} />
      </mesh>
      <Text3D font={InterMediumRegular} size={0.2 * scale} height={0.01} position={[-0.07 + offsetX, -0.6 + offsetY, 0.1]}>
        {keyId.replace('-', '')}
      </Text3D>
    </group>
  )
}

Key.propTypes = {
  grow: PropTypes.string,
  scale: PropTypes.number,
  offsetX: PropTypes.number,
  offsetY: PropTypes.number,
  depth: PropTypes.number,
  keyId: PropTypes.string.isRequired,
  lateral: PropTypes.number,
  round: PropTypes.bool,
  roundResolution: PropTypes.number,
  fingerResolution: PropTypes.number,
  width: PropTypes.number,
  pressedKeys: PropTypes.instanceOf(Map).isRequired,
  setPressedKeys: PropTypes.func.isRequired,
  onKeyPress: PropTypes.func.isRequired,
  onKeyRelease: PropTypes.func.isRequired,
  allKeys: PropTypes.instanceOf(Set).isRequired
}

export default Key
