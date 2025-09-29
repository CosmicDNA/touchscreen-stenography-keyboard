import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { Material } from 'three'
import useMount from './hooks/useMount'
import AnyKey from './AnyKey'
import useKeyGeometry from './hooks/useKeyGeometry' // Import Material

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
 * @property {Set<String>} allKeys - Set of pressed keys.
 * @property {...any} props - Additional props.
 */

/**
 * Key component.
 * @param {KeyProps} props - The props object.
 */
const Key = ({ offsetX = 0, offsetY = 0, scale = 1, roundResolution = 32, fingerResolution = 5, width = 7 / 10, lateral = 7 / 10, depth = 1 / 20, keyId, round, grow, allKeys, armLength, ...props }) => {
  const { onKeyPress, onKeyRelease, materials } = props
  const { isMounted } = useMount()

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

  const geometry = useKeyGeometry({ width, lateral, depth, round, grow, roundResolution })

  return (
    <AnyKey
      geometry={geometry}
      offsetX={offsetX}
      offsetY={offsetY}
      scale={scale}
      lateral={lateral}
      keyId={keyId}
      allKeys={allKeys}
      armLength={armLength}
      materials={materials}
      {...props}
    />
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
  armLength: PropTypes.number,
  round: PropTypes.bool,
  roundResolution: PropTypes.number,
  fingerResolution: PropTypes.number,
  width: PropTypes.number,
  onKeyPress: PropTypes.func.isRequired,
  onKeyRelease: PropTypes.func.isRequired,
  allKeys: PropTypes.instanceOf(Set).isRequired,
  materials: PropTypes.arrayOf(PropTypes.instanceOf(Material)).isRequired
}

export default Key
