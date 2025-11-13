import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import useMount from './hooks/useMount'
import { Text } from '@react-three/drei'

/**
 * A 3D keycap component for a regular keyboard layout.
 * Renders a box geometry with a text label.
 * @param {object} props
 * @param {string} props.id - Unique ID for the key.
 * @param {string} props.label - The text label for the key. Can contain '\n' for multi-line.
 * @param {Array<number>} props.position - [x, y, z] center position of the key.
 * @param {Array<number>} props.size - [width, height, depth] dimensions of the key.
 * @param {THREE.ExtrudeGeometry} props.geometry - The extruded geometry for the keycap.
 * @param {string} [props.color='#333333'] - Base color of the key.
 * @param {string} [props.textColor='#FFFFFF'] - Color of the key label.
 * @param {number} [props.alignment=4] - KLE 'a' property for text alignment (0-8).
 * @param {function} [props.onClick] - Callback for click events.
 * @param {Set<string>} [props.allKeys] - A set of all currently pressed key IDs.
 */
const RegularKey = ({
  id,
  label,
  geometry,
  position,
  size, // [width, height, depth]
  color = '#666666', // Changed to a slightly lighter grey
  textColor = '#FFFFFF',
  alignment = 4, // KLE alignment: 4 is middle center
  allKeys = new Set(),
  onKeyPress,
  onKeyRelease,
  onClick,
  ...props
}) => {
  const { isMounted } = useMount()

  // A key is pressed if its unique ID is in the `allKeys` set.
  const pressed = allKeys.has(id)

  // Watch for changes in the 'pressed' variable
  useEffect(() => {
    if (isMounted) {
      if (pressed) {
        // Trigger onKeyPress event here when 'pressed' becomes true
        onKeyPress(id)
      } else {
        // Trigger onKeyRelease event here when 'pressed' becomes false
        onKeyRelease(id)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pressed])

  // Determine text alignment based on KLE 'a' property
  // These map directly to @react-three/drei/Text anchorX/Y and textAlign
  let anchorX = 'center'
  let anchorY = 'middle'
  let textAlign = 'center'

  switch (alignment) {
    case 0: anchorX = 'left'; anchorY = 'bottom'; textAlign = 'left'; break
    case 1: anchorX = 'center'; anchorY = 'bottom'; textAlign = 'center'; break
    case 2: anchorX = 'right'; anchorY = 'bottom'; textAlign = 'right'; break
    case 3: anchorX = 'left'; anchorY = 'middle'; textAlign = 'left'; break
    case 4: anchorX = 'center'; anchorY = 'middle'; textAlign = 'center'; break
    case 5: anchorX = 'right'; anchorY = 'middle'; textAlign = 'right'; break
    case 6: anchorX = 'left'; anchorY = 'top'; textAlign = 'left'; break
    case 7: anchorX = 'center'; anchorY = 'top'; textAlign = 'center'; break
    case 8: anchorX = 'right'; anchorY = 'top'; textAlign = 'right'; break
    default: anchorX = 'center'; anchorY = 'middle'; textAlign = 'center'; break
  }

  return (
    <group {...props} position={[...position, pressed ? -0.4 : 0]} >
      <mesh
        userData={{ keyId: id }}
        geometry={geometry}
        onClick={onClick}
      >
        <meshStandardMaterial color={pressed ? 'orange' : color} />
      </mesh>
      {label && (
        <Text
          position={[size[0] / 2, size[1] / 2, size[2] / 2 + 0.09]} // Shift text to center
          fontSize={0.3} // Adjust font size as needed
          color={textColor}
          anchorX={anchorX}
          anchorY={anchorY}
          textAlign={textAlign}
          lineHeight={1.2} // Adjust line spacing for multi-line labels
          maxWidth={size[0] - 0.2} // Ensure text fits within key width with some padding
          material-toneMapped={false} // Prevent tone mapping from affecting text color
        >
          {label}
        </Text>
      )}
    </group>
  )
}

// Add PropTypes for validation
RegularKey.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  position: PropTypes.arrayOf(PropTypes.number).isRequired,
  size: PropTypes.arrayOf(PropTypes.number).isRequired,
  geometry: PropTypes.object.isRequired,
  color: PropTypes.string,
  textColor: PropTypes.string,
  alignment: PropTypes.number,
  userData: PropTypes.object,
  allKeys: PropTypes.instanceOf(Set),
  onKeyPress: PropTypes.func.isRequired,
  onKeyRelease: PropTypes.func.isRequired,
  onClick: PropTypes.func
}

export { RegularKey }
