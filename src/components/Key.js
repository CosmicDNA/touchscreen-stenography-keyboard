import PropTypes from 'prop-types'
import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useDrag } from '@use-gesture/react'
import { useThree } from '@react-three/fiber'
// import useAudio from './hooks/useAudio'
import useSound from 'use-sound'
import keypressAudioFile from '../sounds/keypress.flac'
import keyreleaseAudioFile from '../sounds/keyrelease.flac'

const eqSet = (xs, ys) =>
  xs?.size === ys?.size &&
  [...xs].every((x) => ys.has(x))

const getCircularPoints = (segments, resolution, radius, theta0 = 0) => {
  return [...Array(segments).keys()].map(i => {
    const theta = theta0 + 2 * Math.PI * i / resolution
    return [Math.cos(theta) * radius, Math.sin(theta) * radius]
  })
}

/**
 * Represents a Key component.
 * @typedef {Object} KeyProps
 * @property {number} roundResolution - The resolution for rounding.
 * @property {number} width - The width of the key.
 * @property {number} lateral - The lateral dimension of the key.
 * @property {number} depth - The depth of the key.
 * @property {string} keyId - The unique identifier for the key.
 * @property {number} round - The current round.
 * @property {function} setPressedKeys - A function to set pressed keys.
 * @property {Map<string, Set<string>>} pressedKeys - A Map where keys are strings and values can be of any type.
 * @property {Set<string>} allKeys - Set of pressed keys.
 * @property {...any} props - Additional props.
 */

/**
 * Key component.
 * @param {KeyProps} props - The props object.
 */
const Key = ({ roundResolution = 32, fingerResolution = 5, width = 8 / 10, lateral = 7 / 10, depth = 1 / 20, keyId, round, setPressedKeys, pressedKeys, allKeys, ...props }) => {
  const groupRef = useRef()
  const { camera } = useThree()
  const widthOnTwo = width / 2
  const [playKeyPress] = useSound(keypressAudioFile)
  const [playKeyRelease] = useSound(keyreleaseAudioFile, { volume: 0.7 })

  const rawFingerModel = getCircularPoints(
    fingerResolution,
    fingerResolution,
    0.05
  )

  const pressed = allKeys.has(keyId)

  const onKeyPress = () => {
    playKeyPress()
    console.log(`Key ${keyId} was pressed.`)
  }

  const onKeyRelease = () => {
    playKeyRelease()
    console.log(`Key ${keyId} was released.`)
  }

  // Watch for changes in the 'pressed' variable
  useEffect(() => {
    if (pressed) {
      // Trigger onKeyPress event here when 'pressed' becomes true
      onKeyPress()
    } else {
      // Trigger onKeyRelease event here when 'pressed' becomes false
      onKeyRelease()
    }
  }, [pressed])

  const updateMyPressedKeys = (callback) => {
    setPressedKeys(prevPressedKeys => {
      const newMap = new Map(prevPressedKeys)
      callback(newMap)
      return newMap
    })
  }

  const setMyPressedKeys = (newSet) => updateMyPressedKeys((map) => map.set(keyId, newSet))
  const clearMyPressedKeys = () => updateMyPressedKeys((map) => map.delete(keyId))

  let pts
  if (round) {
    const radius = widthOnTwo
    const underSemiCircumference = getCircularPoints(
      roundResolution / 2 + 1,
      roundResolution,
      radius,
      Math.PI
    )

    const pre = [underSemiCircumference[0][0], underSemiCircumference[0][1] + lateral]
    const pos = [underSemiCircumference[underSemiCircumference.length - 1][0], underSemiCircumference[underSemiCircumference.length - 1][1] + lateral]

    pts = [pre, ...underSemiCircumference, pos]
  } else {
    pts = [[-widthOnTwo, 0], [-widthOnTwo, lateral], [widthOnTwo, lateral], [widthOnTwo, 0]]
  }

  const extrudeSettings = {
    depth,
    steps: 1,
    bevelEnabled: true,
    bevelThickness: 8 / 200,
    bevelSize: 0.4 * 8 / 40,
    bevelSegments: 1
  }

  const bind = useDrag(({ event, down }) => {
    if (down) {
      const { clientX, clientY } = event
      const coords = new THREE.Vector2(
        (clientX / window.innerWidth) * 2 - 1,
        -(clientY / window.innerHeight) * 2 + 1
      )
      const fingerVectors = rawFingerModel.map(v => new THREE.Vector2(...v).add(coords))

      const intersects = new Set([...fingerVectors.map(v => {
        const raycaster = new THREE.Raycaster()
        raycaster.setFromCamera(v, camera)
        // Retrieve all key meshes
        const keyMeshes = groupRef.current.parent.children.map(c => c.children[0])
        // Check for intersections with keys
        const intersects = raycaster.intersectObjects(keyMeshes)
        return intersects
      }).flat().map(o => o.object)])

      const previousSet = pressedKeys?.get(keyId)
      const newSet = new Set([...intersects].map(o => o.userData.keyId))
      if (!eqSet(previousSet, newSet)) {
        setMyPressedKeys(newSet)
      }
    } else {
      // Movemen has just ended
      clearMyPressedKeys()
    }
  })

  return (
    <group
      ref={groupRef}
      {...bind()}
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
        {[THREE.Color.NAMES.antiquewhite, THREE.Color.NAMES.gray].map((color, i) =>
          // eslint-disable-next-line react/no-unknown-property
          <meshLambertMaterial key={i} attach={`material-${i}`} args={[{ color, wireframe: false }]} />
        )}
        {/* eslint-disable-next-line react/no-unknown-property */}
        <extrudeGeometry args={[new THREE.Shape(pts.map(points => new THREE.Vector2(...points))), extrudeSettings]} />
      </mesh>
    </group>
  )
}

Key.propTypes = {
  depth: PropTypes.number,
  keyId: PropTypes.string.isRequired,
  lateral: PropTypes.number,
  round: PropTypes.bool,
  roundResolution: PropTypes.number,
  fingerResolution: PropTypes.number,
  width: PropTypes.number,
  pressedKeys: PropTypes.instanceOf(Map).isRequired,
  setPressedKeys: PropTypes.func.isRequired,
  allKeys: PropTypes.instanceOf(Set).isRequired
}

export default Key
