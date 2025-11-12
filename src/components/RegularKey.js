import PropTypes from 'prop-types'
import React from 'react'
import { Box, Text } from '@react-three/drei'

/**
 * A 3D keycap component for a regular keyboard layout.
 * Renders a box geometry with a text label.
 * @param {object} props
 * @param {string} props.id - Unique ID for the key.
 * @param {string} props.label - The text label for the key. Can contain '\n' for multi-line.
 * @param {Array<number>} props.position - [x, y, z] center position of the key.
 * @param {Array<number>} props.size - [width, height, depth] dimensions of the key.
 * @param {string} [props.color='#333333'] - Base color of the key.
 * @param {string} [props.hoverColor='#555555'] - Color when the key is hovered.
 * @param {string} [props.textColor='#FFFFFF'] - Color of the key label.
 * @param {number} [props.alignment=4] - KLE 'a' property for text alignment (0-8).
 * @param {function} [props.onClick] - Callback for click events.
 * @param {function} [props.onPointerOver] - Callback for pointer over events.
 * @param {function} [props.onPointerOut] - Callback for pointer out events.
 */
export function RegularKey ({
  id,
  label,
  position, // [x, y, z] center of the key
  size, // [width, height, depth]
  color = '#666666', // Changed to a slightly lighter grey
  hoverColor = '#555555',
  textColor = '#FFFFFF',
  alignment = 4, // KLE alignment: 4 is middle center
  onClick,
  onPointerOver,
  onPointerOut
}) {
  const [hovered, setHovered] = React.useState(false)

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
    <group position={position}>
      <Box
        args={[size[0], size[1], size[2]]} // width, height, depth
        onPointerOver={(event) => {
          event.stopPropagation()
          setHovered(true)
          onPointerOver && onPointerOver(event)
        }}
        onPointerOut={(event) => {
          event.stopPropagation()
          setHovered(false)
          onPointerOut && onPointerOut(event)
        }}
        onClick={onClick}
      >
        <meshStandardMaterial color={hovered ? hoverColor : color} />
      </Box>
      {label && (
        <Text
          position={[0, 0, size[2] / 2 + 0.01]} // Position text slightly above the key surface
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
  color: PropTypes.string,
  hoverColor: PropTypes.string,
  textColor: PropTypes.string,
  alignment: PropTypes.number,
  onClick: PropTypes.func,
  onPointerOver: PropTypes.func,
  onPointerOut: PropTypes.func
}

RegularKey.propTypes = {
  alignment: PropTypes.number,
  color: PropTypes.string,
  hoverColor: PropTypes.string,
  id: PropTypes.any,
  label: PropTypes.any,
  onClick: PropTypes.any,
  onPointerOut: PropTypes.func,
  onPointerOver: PropTypes.func,
  position: PropTypes.any,
  size: PropTypes.any,
  textColor: PropTypes.string
}
