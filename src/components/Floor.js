import PropTypes from 'prop-types'
import React from 'react'
import useDrag from './hooks/useDrag'

/**
 * Represents a Key component.
 * @typedef {Object} KeyProps
 * @property {Number} fingerResolution - The resolution of the finger for raycasting.
 * @property {String} keyId - The unique identifier for the key.
 * @property {Number} round - The current round.
 * @property {function} setPressedKeys - A function to set pressed keys.
 * @property {Map<String, Set<String>>} pressedKeys - A Map where keys are strings and values can be of any type.
 * @property {...any} props - Additional props.
 */

/**
 * Key component.
 * @param {KeyProps} props - The props object.
 */
const Floor = ({ keyId, setPressedKeys, pressedKeys, ...props }) => {
  const dragProps = useDrag({ keyId, pressedKeys, setPressedKeys })

  // console.log(keyId)
  return (
    <group
      {...dragProps}
      {...props}
    >
      <mesh
        // eslint-disable-next-line react/no-unknown-property
        userData={{ keyId }}
        // eslint-disable-next-line react/no-unknown-property
      >
        {/* eslint-disable-next-line react/no-unknown-property */}
        <planeGeometry attach='geometry' args={[12, 7]} />
        {/* eslint-disable-next-line react/no-unknown-property */}
        <meshPhongMaterial attach='material' depthWrite={false} />
      </mesh>
    </group>
  )
}

Floor.propTypes = {
  keyId: PropTypes.string.isRequired,
  fingerResolution: PropTypes.number,
  pressedKeys: PropTypes.instanceOf(Map).isRequired,
  setPressedKeys: PropTypes.func.isRequired
}

export default Floor
