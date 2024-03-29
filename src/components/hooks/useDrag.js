import { useRef } from 'react'
import { eqSet, getCircularPoints } from '../utils/tools'
import { Vector2, Raycaster } from 'three'
import { useDrag } from '@use-gesture/react'
import { useThree } from '@react-three/fiber'

const useDragHook = ({ fingerResolution = 5, keyId, pressedKeys, updatePressedKeys }) => {
  const groupRef = useRef()
  const { camera } = useThree()
  const rawFingerModel = getCircularPoints(
    fingerResolution,
    fingerResolution,
    0.05
  )

  const setMyPressedKeys = (newSet) => updatePressedKeys((map) => map.set(keyId, newSet))
  const clearMyPressedKeys = () => updatePressedKeys((map) => map.delete(keyId))

  const bind = useDrag(({ event, down }) => {
    if (down) {
      const { clientX, clientY } = event
      const coords = new Vector2(
        (clientX / window.innerWidth) * 2 - 1,
        -(clientY / window.innerHeight) * 2 + 1
      )
      const fingerVectors = rawFingerModel.map(v => new Vector2(...v).add(coords))

      const intersects = new Set([...fingerVectors.map(v => {
        const raycaster = new Raycaster()
        raycaster.far = 50
        raycaster.setFromCamera(v, camera)
        // Retrieve all key meshes
        const keyMeshes = groupRef.current.parent.children
          .filter(c => c.name === 'key group')
          .map(g => g.children[0]) // select first group
          .map(g => g.children[0]) // select first mesh
        // Check for intersections with keys
        const intersects = raycaster.intersectObjects(keyMeshes)
        return intersects
      }).flat().map(o => o.object)])

      const previousSet = pressedKeys?.get(keyId)
      const newSet = new Set([...intersects]
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
