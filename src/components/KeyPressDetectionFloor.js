import PropTypes from 'prop-types'
import React, { useRef } from 'react'
import { getCircularPoints, eqSet } from './utils/tools'
import { Vector2, Raycaster } from 'three'
import useMultiTouchDrag from './hooks/use-multi-touch-drag'
import { useThree } from '@react-three/fiber'

const fingerResolution = 5

const rawFingerModel = getCircularPoints(
  fingerResolution,
  fingerResolution,
  0.05
)
const refFingerVectors = rawFingerModel.map(v => new Vector2(...v))

const KeyPressDetectionFloor = ({ size = 0.6, pressedKeys, updatePressedKeys, ...props }) => {
  const groupRef = useRef()
  const { camera, size: canvasSize } = useThree()

  const setFingerPressedKeys = (fingerId, newSet) => updatePressedKeys((map) => map.set(fingerId, newSet))
  const clearFingerPressedKeys = (fingerId) => updatePressedKeys((map) => map.delete(fingerId))

  useMultiTouchDrag((ev) => {
    if (ev.type === 'onDragEnd') {
      clearFingerPressedKeys(ev.fingerId)
      return
    }

    if (ev.type === 'onDragStart' || ev.type === 'onDragMove') {
      const keyMeshes = groupRef.current?.parent?.children
        .filter(c => c.name === 'key group')
        .map(g => g.children[0])
        .map(g => g.children[0])

      if (!keyMeshes) return

      const { clientX, clientY } = ev.pointer
      const coords = new Vector2(
        (clientX / canvasSize.width) * 2 - 1,
        -(clientY / canvasSize.height) * 2 + 1
      )
      const fingerVectors = refFingerVectors.map(v => v.clone().add(coords))

      const intersectedKeys = new Set([...fingerVectors.flatMap(v => {
        const raycaster = new Raycaster()
        raycaster.far = 50
        raycaster.setFromCamera(v, camera)
        return raycaster.intersectObjects(keyMeshes)
      }).map(o => o.object.userData.keyId)])

      const previousSet = pressedKeys?.get(ev.fingerId)
      if (!eqSet(previousSet, intersectedKeys)) setFingerPressedKeys(ev.fingerId, intersectedKeys)
    }
  })

  return (
    <group
      ref={groupRef}
      {...props}
    >
    </group>
  )
}

KeyPressDetectionFloor.propTypes = {
  size: PropTypes.number,
  pressedKeys: PropTypes.instanceOf(Map),
  updatePressedKeys: PropTypes.func
}

export default KeyPressDetectionFloor
