import { useRef } from 'react'
import { eqSet, getCircularPoints } from '../utils/tools'
import * as THREE from 'three'
import { useDrag } from '@use-gesture/react'
import { useThree } from '@react-three/fiber'

const useDragHook = ({ fingerResolution = 5, keyId, pressedKeys, setPressedKeys }) => {
  const groupRef = useRef()
  const { camera } = useThree()
  const rawFingerModel = getCircularPoints(
    fingerResolution,
    fingerResolution,
    0.05
  )

  const updateMyPressedKeys = (callback) => {
    setPressedKeys(prevPressedKeys => {
      const newMap = new Map(prevPressedKeys)
      callback(newMap)
      return newMap
    })
  }

  const setMyPressedKeys = (newSet) => updateMyPressedKeys((map) => map.set(keyId, newSet))
  const clearMyPressedKeys = () => updateMyPressedKeys((map) => map.delete(keyId))

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
      const newSet = new Set([...intersects]
        .filter(o => o.userData.keyId !== 'floor')
        .map(o => o.userData.keyId)
      )
      if (!eqSet(previousSet, newSet)) {
        setMyPressedKeys(newSet)
      }
    } else {
      // Movement has just ended
      clearMyPressedKeys()
    }
  })
  return { ref: groupRef, ...bind() }
}

export default useDragHook
