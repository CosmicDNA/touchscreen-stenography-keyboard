import React from 'react'
import PropTypes from 'prop-types'
import Key from './Key'
import * as THREE from 'three'

const KeyGroup = ({ keys, name, position, round, ...props }) => {
  return (
    <>
      {[...Array(keys.length).keys()].map(i =>
        <Key position={[position.x + i, position.y, position.z]} keyId={keys[i]} key={`${name}_${keys[i]}`} round={round} {...props}/>
      )}
    </>
  )
}

KeyGroup.propTypes = {
  keys: PropTypes.arrayOf(PropTypes.string).isRequired,
  name: PropTypes.string.isRequired,
  position: PropTypes.instanceOf(THREE.Vector3).isRequired,
  round: PropTypes.bool,
  pressedKeys: PropTypes.objectOf(Map).isRequired,
  setPressedKeys: PropTypes.func.isRequired
}

export default KeyGroup
