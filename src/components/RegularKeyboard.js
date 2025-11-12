import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useRegularKeyGeometry } from './hooks/useRegularKeyGeometry'
import { RegularKey } from './RegularKey'
// Assuming the path to your JSON layout file
import fatAssEnter60Layout from '../components/utils/keyboardLayouts/fat-ass-enter-60.json'

/**
 * Renders a 3D regular keyboard based on a KLE JSON layout.
 */
const RegularKeyboard = () => {
  const groupRef = useRef()
  // Use the custom hook to get the calculated geometries for each key
  const keyGeometries = useRegularKeyGeometry(fatAssEnter60Layout)

  // Optional: Add some animation or rotation to the keyboard
  useFrame(() => {
    if (groupRef.current) {
      // Example: Tilt the keyboard slightly for a better view
      // groupRef.current.rotation.x = Math.PI / 8;
      // Example: Slowly rotate the keyboard
      // groupRef.current.rotation.y += 0.005;
    }
  })

  const handleKeyClick = (label) => {
    console.log(`Key clicked: ${label}`)
    // Implement your key press logic here, e.g., send to a websocket or update state
  }

  return (
    <group ref={groupRef} position={[0, 0, 0]} rotation-x={-Math.PI / 2}> {/* Add rotation to lay flat */}
      {keyGeometries.map((keyGeo) => (
        <RegularKey key={keyGeo.id} {...keyGeo} onClick={() => handleKeyClick(keyGeo.label)} />
      ))}
    </group>
  )
}

export default RegularKeyboard
