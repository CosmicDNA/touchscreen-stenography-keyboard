import PropTypes from 'prop-types'
import React from 'react'
import { Material } from 'three'
import AnyKey from './AnyKey'
import useKeyGeometry from './hooks/useKeyGeometry' // Import Material

/**
 * Represents a Key component.
 * @typedef {Object} KeyProps
 * @property {String} grow - Whether the key grows towards left or right.
 * @property {Number} offsetX - The horizontal offset for the key's text.
 * @property {Number} offsetY - The vertical offset for the key's text.
 * @property {Number} scale - The scaling factor for the key's text.
 * @property {Number} roundResolution - The resolution for rounding.
 * @property {Number} width - The width of the key.
 * @property {Number} lateral - The lateral dimension of the key.
 * @property {Number} depth - The depth of the key.
 * @property {String} keyId - The unique identifier for the key.
 * @property {Number} round - The current round.
 * @property {Number} armLength - The length of the key's lever arm.
 * @property {Set<String>} allKeys - Set of pressed keys.
 * @property {...any} props - Additional props.
 */

/**
 * Key component.
 * @param {KeyProps} props - The props object.
 */
const Key = ({ offsetX = 0, offsetY = 0, scale = 1, roundResolution = 32, width = 7 / 10, lateral = 7 / 10, depth = 1 / 20, keyId, round, grow, allKeys, armLength, ...props }) => {
  const { materials } = props

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
  width: PropTypes.number,
  onKeyPress: PropTypes.func.isRequired,
  onKeyRelease: PropTypes.func.isRequired,
  allKeys: PropTypes.instanceOf(Set).isRequired,
  materials: PropTypes.arrayOf(PropTypes.instanceOf(Material)).isRequired
}

export default Key
