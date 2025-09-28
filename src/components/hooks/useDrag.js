import { useRef, useMemo } from 'react'
import { eqSet, getCircularPoints } from '../utils/tools'
import { Vector2, Raycaster } from 'three'
import { useDrag } from '@use-gesture/react'
import { useThree } from '@react-three/fiber'

const useDragHook = ({ fingerResolution = 5, keyId, pressedKeys, updatePressedKeys }) => {
  const groupRef = useRef()
  const { camera, scene } = useThree()
  const rawFingerModel = getCircularPoints(
    fingerResolution,
    fingerResolution,
    0.05
  )

  // Memoize the raycaster and the list of meshes to avoid re-calculating on every drag event.
  const [raycaster, keyMeshes] = useMemo(() => {
    const meshes = []
    scene.traverse(child => {
      if (child.isMesh && (child.userData.keyId || child.parent.userData.keyId)) {
        meshes.push(child)
      }
    })
    return [new Raycaster(), meshes] // Re-run when pressedKeys changes to ensure all meshes are found
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, pressedKeys])

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
        raycaster.far = 50
        raycaster.setFromCamera(v, camera)
        const intersects = raycaster.intersectObjects(keyMeshes, false)
        return intersects
      }).flat().map(o => o.object)])

      const previousSet = pressedKeys?.get(keyId)
      const newSet = new Set(
        [...intersects].map(
          (o) => o.userData.keyId || o.parent.userData.keyId
        )
          .filter(Boolean)
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
